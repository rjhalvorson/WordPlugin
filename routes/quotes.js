/**
 * Created by rhalvorson on 12/30/16.
 */
var express = require('express');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var router = express.Router();
var passport = require('passport');
var jsforce = require('jsforce');
var dbHelper = new(require('../database/db'))();
var cAppConfig = require('../models/ws-conf').connectedAppConfig;
var io = require('../app');

io.on('downloadDoc', function onConnection(socket) {
    console.log('Felt Link Click');
});

router.get('/viewQuotes', function(req, res){

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
                        conn.sobject("SBQQ__QuoteDocument__c")
                            .find(
                                // conditions in JSON object
                                {
                                    'SBQQ__Quote__r.Id' : { $eq : req.params.quoteId}
                                },
                                // fields in JSON object
                                { Id: 1,
                                    Name: 1,
                                    SBQQ__ViewRecordId__c : 1,
                                    SBQQ__Version__c : 1,
                                    SBQQ__OutputFormat__c : 1
                                }
                            )
                            .execute(function(err, result2) {
                                if (err) {
                                    return console.error(err);
                                } else {
                                    res.render('quote', {
                                        quote: result[0],
                                        docs: result2
                                    });
                                }
                            });
                    });
            }
        }
    );
});

router.get('/currentQuote', function(req, res){
    dbHelper.getUserData(
        req.user.profileId,
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

                conn.sobject("SBQQ__Quote__c")
                    .find(
                        // conditions in JSON object
                        {
                            Id: {$eq: "a0l41000004e7UrAAI"}
                        },
                        // fields in JSON object
                        {
                            Id: 1,
                            Name: 1,
                            Account_Name__c: 1,
                            Opportunity_Name__c: 1,
                            Quote_Owner__c: 1,
                            SBQQ__NetAmount__c: 1,
                            SBQQ__PaymentTerms__c: 1,
                            SBQQ__Status__c: 1
                        }
                    ).execute(function (err, result2) {
                    if (err) {
                        return console.error(err);
                    } else {
                        res.render('currentQuote', {
                            quote: result[0]
                        });
                    }
                });
            }
        });
});


module.exports = router;