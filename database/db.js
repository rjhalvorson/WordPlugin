var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var dbFile = './database/db.sqlite3';

function dbHelper() { }

/**
 * Create SQLite3 table UserData
 */
dbHelper.prototype.createDatabase = function createDatabase() {
    var dbExists = fs.existsSync(dbFile);
    var db = new sqlite3.Database(dbFile);
    var createUserDataStatement =
        'CREATE TABLE UserData (' +
        'Sfid TEXT NOT NULL, ' +
        'SessionID TEXT NOT NULL, ' +
        'DisplayName TEXT  NOT NULL, ' +
        'AccessToken TEXT NOT NULL, ' +
        'RefreshToken TEXT NOT NULL, ' +
        'InstanceUrl TEXT NOT NULL, ' +
        'PRIMARY KEY (Sfid)' +
        ')';

    db.serialize(function createTables() {
        if (!dbExists) {
            db.run(
                createUserDataStatement,
                [],
                function callback(error) {
                    if (error !== null) {
                        throw error;
                    }
                }
            );
        }
    });
    db.close();
};

dbHelper.prototype.getUserData = function getUserData(sfid, callback) {
    var userData = {};
    var db = new sqlite3.Database(dbFile);
    var getUserDataStatement =
        'SELECT AccessToken, RefreshToken, InstanceUrl ' +
        'FROM UserData WHERE Sfid = $sfid';

    userData.sfid = sfid;

    db.serialize(function executeSelect() {
        db.all(
            getUserDataStatement,
            {
                $sfid: sfid
            },
            function queryExecute(error, userDetails){
                if(error !== null){
                    throw error;
                } else{
                    userData.dts = userDetails;
                    callback(error, userData);
                }
            }
        );
    });
};

dbHelper.prototype.saveAccessToken =
    function saveAccessToken(sfid, sessionID, displayName, accessToken, refreshToken, instanceUrl, callback) {
        var db = new sqlite3.Database(dbFile);
        var insertStatement = 'INSERT INTO UserData ' +
            '(Sfid, SessionID, DisplayName, AccessToken, RefreshToken, InstanceUrl) ' +
            'VALUES ($sfid, $sessionID, $displayName, $accessToken, $refreshToken, $instanceUrl)';

        db.serialize(function executeInsert() {
            db.run(
                insertStatement,
                {
                    $sfid: sfid,
                    $sessionID: sessionID,
                    $displayName: displayName,
                    $accessToken: accessToken,
                    $refreshToken: refreshToken,
                    $instanceUrl: instanceUrl
                },
                callback
            );
        });
    };

dbHelper.prototype.deleteAccessToken =
    function deleteAccessToken(sfid, callback) {
        var db = new sqlite3.Database(dbFile);
        var deleteStatement = 'DELETE FROM UserData WHERE ' +
            'Sfid = $sfid';

        db.serialize(function executeDelete() {
            db.run(
                deleteStatement,
                {
                    $sfid: sfid
                },
                callback
            );
        });
    };

module.exports = dbHelper;
