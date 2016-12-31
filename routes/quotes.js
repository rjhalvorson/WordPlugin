/**
 * Created by rhalvorson on 12/30/16.
 */
var express = require('express');
var router = express.Router();
var passport = require('passport');
var jsforce = require('jsforce');

router.get('/viewQuotes', function(req, res){
    console.log(req.session.id);
    var conn = new jsforce.Connection({
        instanceUrl : 'https://na35.salesforce.com',
        accessToken : 'aPrxSV6UAcNrPEkZ5enfdkEM20Pl8qic9.2NXKLW4mT6_dwVso_0mWCKuEh8SVA2Qohh8rqUng%3D%3D'
    });

    var records = [];
    conn.query("SELECT Id, Name FROM Account", function(err, result) {
        if (err) { return console.error(err); }
        console.log("total : " + result.totalSize);
        console.log("fetched : " + result.records.length);
    });

    res.render('quotes', {
        records: records
    })
});


module.exports = router;