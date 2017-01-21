/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
'use strict';


var socket = io.connect('https://localhost:3002', { secure: true });
// The token will only live in our database for 2 minutes
var tokenLifetime = 120000;
var timers = {};

socket.on('auth_success', function onAuthSuccess(authenticationData) {
    // Show the 'connected' UI for the authenticated provider

    $('#' +  'initial_login').css('display', 'none');
    $('#' + 'get_started').css('display', 'block');

    window.location.href = 'https://localhost:3000/home';
});

socket.on('doc_ready', function loadDocument(quoteDoc) {

    Word.run(function (context) {

        // Create a proxy object for the document.
        var thisDocument = context.document;

        // Queue a command to clear the body contents.
        thisDocument.body.clear();

        // Create a proxy object for the default selection.
        var mySelection = thisDocument.getSelection();

        // Queue a command to insert the file into the current document.
        mySelection.insertFileFromBase64(quoteDoc, "replace");

        // Synchronize the document state by executing the queued commands,
        // and return a promise to indicate task completion.
        return context.sync()
            .then(function () {
                // Now we want to get all of the content controls.
                getAllContentControls();
            });
    })
        .catch(function (error) {
            console.log('Error: ' + JSON.stringify(error));
            if (error instanceof OfficeExtension.Error) {
                console.log('Debug info: ' + JSON.stringify(error.debugInfo));
            }
        });
});

socket.on('disconnect_complete', function onDisconnectComplete(providerName) {
    clearTimeout(timers[providerName]);
    $('#' + providerName + '_disconnected').css('display', 'block');
    $('#' + providerName + '_connected').css('display', 'none');
    Office.context.document.setSelectedDataAsync(providerName + ' disconnected');
});

socket.on('termSearchResults', function populateSearchResults(termSearchResults) {
    createTermTable(termSearchResults);
});

// The initialize function must be run each time a new page is loaded.
Office.initialize = function officeInitialize(reason) {
    $(document).ready(function officeReady() {});
};

function silentDisconnect(sessionID, providerName) {
    window.open(
        'https://localhost:3000/disconnect/' + providerName + '/' + sessionID,
        'AuthPopup',
        'width=500,height=500,centerscreen=1,menubar=0,toolbar=0,location=0,personalbar=0,status=0,titlebar=0,dialog=1'
    );
}

$(document).ready(function(){
    $('.docLink').click(function(){
        socket.emit('downloadDoc', $(this).attr('documentId'));
    });
});

$(document).ready(function(){
var getSearchQuery = function (callback) {
    var querySet = [];
    $('.searchTermFields')
        .map(function () {
            var query = {};
            query.fieldApi = $('.termApiName Label', this).attr('searchField');
            query.operator = $('.termOperator Select', this).val();
            if ($('.termSearchValue Label', this).attr('fieldType') == "PICKLIST") {
                query.sVal = $('.termSearchValue select', this).val();
            } else {
                query.sVal = $('.termSearchValue input', this).val();
            }
            querySet.push(query);
        });
    callback(querySet);
}

    $('#termSearch').click(function(){
        getSearchQuery(function (searchCriteria) {
            socket.emit('searchTerms', searchCriteria);
        })
    });
});

function createTermTable(searchTerms) {

    var tbl = "<table class='ms-Table'><th>Action</th><th>Name</th><th>Status</th><th style='width:50%'>Body</th>";
    for (var i = 0; i < searchTerms.length; i++){
        tbl = tbl + "<tr>";
        tbl = tbl + "<td>" + "<button class='ms-Button ms-Button--command insertButton' value=searchTerms[i].Name><span class='ms-Button-icon'><i class='ms-Icon ms-Icon--plus'></i></span> <span class='ms-Button-label'>Insert</span><span class='ms-Button-description'>Inserts Quote Term into Document</span></button>" + "</td>";
        tbl = tbl + "<td>" + "<a href='/quotes/viewQuote'" + searchTerms[i].Id + ">" + searchTerms[i].Name + "</a>" + "</td>";
        tbl = tbl + "<td>" + searchTerms[i].SBQQ__Status__c + "</td>";
        tbl = tbl + "<td class='termContainer'>" + searchTerms[i].SBQQ__Body__c + "</td>";
        tbl = tbl + "</tr>";
    }
    tbl = tbl + "</table>";

    var divContainer = document.getElementById("termResults");
    divContainer.innerHTML = "";
    divContainer.innerHTML = tbl;
}

$(document).ready(function(){
    $(document).on("click", ".insertButton", function () {
        var htmlBody = $(this).parents('tr').find(".termContainer").html();
        // Run a batch operation against the Word object model.
        Word.run(function (context) {

            // Create a proxy object for the document body.
            var range = context.document.getSelection();
            // Queue a commmand to insert HTML in to the beginning of the body.
            range.insertHtml(htmlBody, Word.InsertLocation.replace);
            //body.insertText('text here', Word.InsertLocation.start);

            // Synchronize the document state by executing the queued commands,
            // and return a promise to indicate task completion.
            return context.sync().then(function () {
                console.log('HTML added to the beginning of the document body.');
            });
        })
            .catch(function (error) {
                console.log('Error: ' + JSON.stringify(error));
                if (error instanceof OfficeExtension.Error) {
                    console.log('Debug info: ' + JSON.stringify(error.debugInfo));
                }
            });

    });
});