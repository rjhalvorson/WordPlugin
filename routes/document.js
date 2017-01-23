/**
 * Created by rhalvorson on 1/1/17.
 */
var express = require('express');
var router = express.Router();
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var jsforce = require('jsforce');
var dbHelper = new(require('../database/db'))();
var cAppConfig = require('../models/ws-conf').connectedAppConfig;
var fs = require('fs');
var io = require('../app');

router.get('/download:docId', function(req, res){

    dbHelper.getUserData(
        req.user.profileId,
        function callback(error, userDetails) {
            if (error) {
                throw error;
            } else {
                var conn = new jsforce.Connection({
                    oauth2 : {
                        clientId : cAppConfig.clientID,
                        clientSecret : cAppConfig.clientSecret,
                        redirectUri : cAppConfig.callbackURL
                    },
                    instanceUrl : userDetails.dts[0].InstanceUrl,
                    accessToken : userDetails.dts[0].AccessToken,
                    refreshToken : userDetails.dts[0].RefreshToken
                });
                conn.on("refresh", function(accessToken, res) {
                    // Refresh event will be fired when renewed access token
                    // to store it in your storage for next request
                });

                var fout = fs.createWriteStream('./file.docx');
                var r = conn.sobject('Document').record(req.params.docId).blob('Body').pipe(fout);
                r.on('error', function(err) {
                    console.log(err);
                });
                r.on('finish', function(){
                    fout.close();
                    var base64doc = r.toString('base64');
                    console.log(base64doc);
                    //res.download(fout.path, 'myFile.docx');
                    io.to(req.sessionID).emit('doc_ready', base64doc);
                });
            }
        }
    );
});

module.exports = router;

