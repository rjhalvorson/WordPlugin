/**
 * Created by rhalvorson on 1/20/17.
 */
var util = require('./utility.js');
var comparison = require('../models/comparisonOperators.js').comparisonMatrix;


var getQuoteTerms = function(sessionId, searchOb, sendData){
        getSearchString(searchOb, function(searchString){
            util.getjsForceConnection(sessionId, function (conn) {

                conn.query(searchString, function (err, result) {
                    if (err) {
                        return console.error(err);
                    }
                    sendData(result.records);
                });
            });
        })
};

var getQuoteTerm = function(sessionId, termId, sendData){
    util.getjsForceConnection(sessionId, function(conn){
        conn.sobject("SBQQ__QuoteTerm__c").retrieve(termId, function(err, term) {
            if (err) {
                return console.error(err);
            }
            sendData(term);
        });
    })
};

var getSearchString = function(criteria, callback){
    var searchString = 'Select Id, Name, Font__c, Font_Size__c, SBQQ__Status__c, SBQQ__Body__c From SBQQ__QuoteTerm__c';
    for (var i = 0; i < criteria.length; i++) {
        if(i == 0){
            searchString = searchString + ' WHERE ';
        }
        if(criteria[i].sVal === ""){
            continue;
        }
        searchString = searchString + criteria[i].fieldApi + ' ' + comparison[criteria[i].operator] + ' \'' + criteria[i].sVal + '\' AND ';
    }
    if(criteria.length > 0){
        searchString = searchString.substring(0, searchString.length - 4);
    }
    callback(searchString);
};

exports.getSearchString = getSearchString;
exports.getQuoteTerms = getQuoteTerms;
exports.getQuoteTerm = getQuoteTerm;