/**
 * Created by rhalvorson on 1/15/17.
 */
var dbHelper = new(require('./database/db'))();
var jsforce = require('jsforce');
var cAppConfig = require('./ws-conf').connectedAppConfig;
var fs = require('fs');
var base64 = require('file-base64');


var getBase64File = function(docId, sessionId, sendDoc) {

    dbHelper.getUserDataSessionID(
        sessionId,
        function callback(error, userDetails) {
            if (error) {
                throw error;
            } else {
                var conn = new jsforce.Connection({
                    oauth2: {
                        clientId: cAppConfig.clientID,
                        clientSecret: cAppConfig.clientSecret,
                        redirectUri: cAppConfig.callbackURL
                    },
                    instanceUrl: userDetails.dts[0].InstanceUrl,
                    accessToken: userDetails.dts[0].AccessToken,
                    refreshToken: userDetails.dts[0].RefreshToken
                });
                conn.on("refresh", function (accessToken, res) {
                    // Refresh event will be fired when renewed access token
                    // to store it in your storage for next request
                });

                var fout = fs.createWriteStream('./' + docId + '.docx');
                var r = conn.sobject('Document').record(docId).blob('Body').pipe(fout);
                r.on('error', function (err) {
                    console.log(err);
                });
                r.on('finish', function () {
                    fout.close();
                    base64.encode('./' + docId + '.docx', function(err, base64String) {
                        console.log(base64String);
                        sendDoc(base64String);
                    });
                });
            }
        });
}

exports.getBase64File = getBase64File;