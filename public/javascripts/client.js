'use strict';

var socket = io.connect('https://localhost:3002', { secure: true });
// The token will only live in our database for 2 minutes
var tokenLifetime = 120000;
var timers = {};

socket.on('auth_success', function onAuthSuccess(authenticationData) {
    console.log('here');

    $('#' +  'initial_login').css('display', 'none');
    $('#' + 'get_started').css('display', 'block');

    console.log(authenticationData);
    // Update the Office host
    Office.context.document.setSelectedDataAsync(
        authenticationData.accessToken.params.instance_url + ' connected \n' +
        'User: ' + authenticationData.displayName
    );
});

/*
socket.on('doc_ready', function openDocument(myBase64) {
    Word.run(function (context) {

        // Create a proxy object for the document.
        var thisDocument = context.document;

        // Queue a command to clear the body contents.
        thisDocument.body.clear();

        // Create a proxy object for the default selection.
        var mySelection = thisDocument.getSelection();

        // Queue a command to insert the file into the current document.
        mySelection.insertFileFromBase64(myBase64, "replace");

        // Synchronize the document state by executing the queued commands,
        // and return a promise to indicate task completion.
        return context.sync()
            .catch(function (error) {
                console.log('Error: ' + JSON.stringify(error));
                if (error instanceof OfficeExtension.Error) {
                    console.log('Debug info: ' + JSON.stringify(error.debugInfo));
                }
            });
    });
}); */

socket.on('disconnect_complete', function onDisconnectComplete(providerName) {
    clearTimeout(timers[providerName]);
    $('#' + providerName + '_disconnected').css('display', 'block');
    $('#' + providerName + '_connected').css('display', 'none');
    Office.context.document.setSelectedDataAsync(providerName + ' disconnected');
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
