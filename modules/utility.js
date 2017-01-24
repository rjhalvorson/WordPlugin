/**
 * Created by rhalvorson on 1/15/17.
 */
var dbHelper = new(require('./../database/db'))();
var jsforce = require('jsforce');
var cAppConfig = require('./../models/ws-conf').connectedAppConfig;
var fs = require('fs');
var base64 = require('file-base64');


var getBase64File = function(docId, sessionId, sendDoc) {
    getjsForceConnection(sessionId, function (conn) {
        var fout = fs.createWriteStream('./' + docId + '.docx');
        var r = conn.sobject('Document').record(docId).blob('Body').pipe(fout);
        r.on('error', function (err) {
            console.log(err);
        });
        r.on('finish', function () {
            fout.close();
            base64.encode('./' + docId + '.docx', function (err, base64String) {
                console.log(base64String);
                sendDoc(base64String);
            });
        });
    });
};


var saveBase64File = function(sessionId, blob, callback){
        getjsForceConnection(sessionId, function(conn) {
            conn.sobject("Document").create(
                {
                    Description: "Quote",
                    Keywords: "quote",
                    FolderId: "00541000001sD9V",
                    Name: "Redlined Quote",
                    Type: "docx",
                    body: blob
                },
                function (err, ret) {
                    if (err || !ret.success) {
                        return console.error(err, ret);
                    }
                    conn.sobject("SBQQ__QuoteDocument__c").create(
                        {
                            Name: 'Redlined Document',
                            SBQQ__AttachmentId__c: ret.id,
                            SBQQ__Version__c: 100,
                            SBQQ__Quote__c: 'a0l41000004e7Ur',
                            SBQQ__OutputFormat__c : "MS Word"
                        },
                        function (err, ret) {
                            if (err || !ret.success) {
                                return console.error(err, ret);
                            }
                            callback(ret.id);
                        }
                    )
                });
            });
};




var getjsForceConnection = function(sessionId, sendConn){
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

                sendConn(conn);
            }
        });
};

var getFieldsInSet = function(sessionId, object, sendSet){
    getjsForceConnection(sessionId, function(conn){
            conn.apex.post('/services/apexrest/getSearchFields',
                {
                    fieldSetObject : object
                },
                function(err, fs) {
                if (err) {
                    return console.error(err);
                }

            conn.describe(object, function(err, meta) {
                if (err) {
                    return console.error(err);
                }
                getSearchFields(fs[0].fsetwrap, meta.fields, function(data){
                    sendSet(data);
                })
            });
        });
    });
};


var getSearchFields = function(fs, meta, sendFields){
    var searchFields = [];
    for(var i = 0; i < meta.length; i++){
        for(var j = 0; j < fs.length; j++){
            if(meta[i].name === fs[j].fieldpath){
                var searchField = {};
                searchField.label = fs[j].fieldlabel;
                searchField.type = fs[j].fieldtype;
                searchField.apiName = fs[j].fieldpath;
                if(fs[j].fieldtype === "PICKLIST"){
                    for(var k = 0; k < meta[i].picklistValues.length; k++){
                        searchField.fVals = meta[i].picklistValues;
                    }
                }

                searchFields.push(searchField);
            }
        }
    }

    sendFields(searchFields);
}


exports.getBase64File = getBase64File;
exports.getjsForceConnection = getjsForceConnection;
exports.getFieldsInSet = getFieldsInSet;
exports.saveBase64File = saveBase64File;


/*
 var getSearchFields = function(sessionId, object, fieldSet, sendFields){
 getjsForceConnection(sessionId, function(conn){
 conn.sobject(object).describe(function(err, meta) {
 if (err) {
 return console.error(err);
 }
 sendFields(meta);
 });
 });
 }
 */



/*
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
 } */