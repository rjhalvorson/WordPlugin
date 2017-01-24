/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
'use strict';


var socket = io.connect('https://localhost:3002', { secure: true });
// The token will only live in our database for 2 minutes
var tokenLifetime = 120000;
var timers = {};

// The initialize function must be run each time a new page is loaded.
Office.initialize = function officeInitialize(reason) {
    $(document).ready(function officeReady() {});
};

socket.on('auth_success', function onAuthSuccess(authenticationData) {
    // Show the 'connected' UI for the authenticated provider

    $('#' +  'initial_login').css('display', 'none');
    $('#' + 'get_started').css('display', 'block');

    window.location.href = 'https://localhost:3000/home';
});

socket.on('doc_ready', function loadDocument(quoteDoc) {

    Word.run(function (context) {

        // Create a proxy object for the document.
        var thisDocument = context.application.createDocument(quoteDoc);

        // Queue a command to clear the body contents.
        thisDocument.open();

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

/*

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

 */

socket.on('disconnect_complete', function onDisconnectComplete(providerName) {
    clearTimeout(timers[providerName]);
    $('#' + providerName + '_disconnected').css('display', 'block');
    $('#' + providerName + '_connected').css('display', 'none');
    Office.context.document.setSelectedDataAsync(providerName + ' disconnected');
});

socket.on('termSearchResults', function populateSearchResults(termSearchResults) {
    createTermTable(termSearchResults);
});

socket.on('termResult', function insertTerm(termBody, fontName, fontSize){
    Word.run(function (context) {

        // Create a proxy object for the document body.
        var range = context.document.getSelection();
        // Queue a commmand to insert HTML in to the beginning of the body.
        range.insertHtml(termBody, Word.InsertLocation.replace);
        //body.insertText('text here', Word.InsertLocation.start);

        // Synchronize the document state by executing the queued commands,
        // and return a promise to indicate task completion.
        return context.sync().then(function () {

            // Create a proxy object for the font object on the first paragraph in the collection.
            var font = range.font;

            // Queue a set of property value changes on the font proxy object.
            font.size = fontSize;
            font.name = fontName;

            return context.sync().then(function () {
                console.log('HTML added to the beginning of the document body.');

            });
        });
    })
        .catch(function (error) {
            console.log('Error: ' + JSON.stringify(error));
            if (error instanceof OfficeExtension.Error) {
                console.log('Debug info: ' + JSON.stringify(error.debugInfo));
            }
        });
});

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
        window.open('', '_self', ''); window.close();
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
        tbl = tbl + "<td>" + "<button class='ms-Button ms-Button--command insertButton' value='" + searchTerms[i].Id +"'><span class='ms-Button-icon'><i class='ms-Icon ms-Icon--plus'></i></span> <span class='ms-Button-label'>Insert</span><span class='ms-Button-description'>Inserts Quote Term into Document</span></button>" + "</td>";
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
        socket.emit("getTerm", $(this).attr('value'));
        window.open('', '_self', ''); window.close();
        // Run a batch operation against the Word object model.
    });
});

$(document).ready(function(){
    $('#saveDocument').click(function(){
        updateStatus("Ready to send file.");
        sendFile();
    });

// Create a function for writing to the status div.
    function updateStatus(message) {
        console.log(message);
    }

    // Get all of the content from a PowerPoint or Word document in 100-KB chunks of text.
    function sendFile() {
        Office.context.document.getFileAsync("compressed",
            { sliceSize: 100000 },
            function (result) {
                    console.log("async finished");
                if (result.status == Office.AsyncResultStatus.Succeeded) {

                    // Get the File object from the result.
                    var myFile = result.value;
                    var state = {
                        file: myFile,
                        counter: 0,
                        sliceCount: myFile.sliceCount
                    };

                    updateStatus("Getting file of " + myFile.size + " bytes");
                    getSlice(state);
                }
                else {
                    updateStatus(result.status);
                }
            });
    }

    // Get a slice from the file and then call sendSlice.
    function getSlice(state) {
        state.file.getSliceAsync(state.counter, function (result) {
            if (result.status == Office.AsyncResultStatus.Succeeded) {
                updateStatus("Sending piece " + (state.counter + 1) + " of " + state.sliceCount);
                sendSlice(result.value, state);
            }
            else {
                updateStatus(result.status);
            }
        });
    }

    function sendSlice(slice, state) {
        var data = slice.data;

        // If the slice contains data, create an HTTP request.
        if (data) {

            // Encode the slice data, a byte array, as a Base64 string.
            // NOTE: The implementation of myEncodeBase64(input) function isn't
            // included with this example. For information about Base64 encoding with
            // JavaScript, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding.
            // var fileData = myEncodeBase64(data);
            // var fileData = window.btoa(data);

            var fileData = base64ArrayBuffer(data);

            // Create a new HTTP request. You need to send the request
            // to a webpage that can receive a post.
            var request = new XMLHttpRequest();

            // Create a handler function to update the status
            // when the request has been sent.
            request.onreadystatechange = function () {
                if (request.readyState == 4) {
                    updateStatus("Sent " + slice.size + " bytes.");
                    state.counter++;

                    if (state.counter < state.sliceCount) {
                        getSlice(state);
                    }
                    else {
                        closeFile(state);
                    }
                }
            }

            request.open("POST", "https://localhost:3000/document/save");
            request.setRequestHeader("Slice-Number", slice.index);

            // Send the file as the body of an HTTP POST
            // request to the web server.
            request.send(fileData);
        }
    }

    function closeFile(state) {
        // Close the file when you're done with it.
        state.file.closeAsync(function (result) {

            // If the result returns as a success, the
            // file has been successfully closed.
            if (result.status == "succeeded") {
                updateStatus("File closed.");
            }
            else {
                updateStatus("File couldn't be closed.");
            }
        });
    }
});