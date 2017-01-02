/**
 * Created by rhalvorson on 12/30/16.
 */
var express = require('express');
var router = express.Router();
var passport = require('passport');
var jsforce = require('jsforce');
var dbHelper = new(require('../database/db'))();
var cAppConfig = require('../ws-conf').connectedAppConfig;

router.get('/viewQuotes', function(req, res){

    dbHelper.getUserData(
        req.user.id,
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

                conn.sobject("SBQQ__Quote__c")
                    .find(
                        // conditions in JSON object
                        {},
                        // fields in JSON object
                        { Id: 1,
                            Name: 1,
                            Account_Name__c : 1,
                            Opportunity_Name__c : 1,
                            Quote_Owner__c : 1,
                            SBQQ__NetAmount__c : 1,
                            SBQQ__PaymentTerms__c : 1,
                            SBQQ__Status__c: 1 }
                    )
                    .execute(function(err, result) {
                        if (err) {
                            return console.error(err);
                        }
                        res.render('quotes', {
                            quotes: result
                        });
                    });
            }
        }
    );
});

router.get('/viewQuote:quoteId', function(req, res){
    dbHelper.getUserData(
        req.user.id,
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

                conn.sobject("SBQQ__Quote__c")
                    .find(
                        // conditions in JSON object
                        {
                            Id : { $eq : req.params.quoteId}
                        },
                        // fields in JSON object
                        { Id: 1,
                            Name: 1,
                            Account_Name__c : 1,
                            Opportunity_Name__c : 1,
                            Quote_Owner__c : 1,
                            SBQQ__NetAmount__c : 1,
                            SBQQ__PaymentTerms__c : 1,
                            SBQQ__Status__c: 1 }
                    )
                    .execute(function(err, result) {
                        if (err) {
                            return console.error(err);
                        }
                        res.render('quote', {
                            quote: result[0]
                        });
                    });
            }
        }
    );
});


module.exports = router;