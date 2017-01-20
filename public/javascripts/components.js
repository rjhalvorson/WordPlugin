$(document).ready(function() {
    // File Picker demo fixes
    if ($('.ms-FilePicker').length > 0) {
        $('.ms-FilePicker').css({
            "position": "absolute !important"
        });

        $('.ms-Panel').FilePicker();
    } else {
        if ($.fn.TextField) {
            $('.ms-TextField').TextField();
        }
    }

    // Vanilla JS Components
    if (typeof fabric !== "undefined") {
        if ('TextField' in fabric) {
            var elements = document.querySelectorAll('.ms-TextField');
            var i = elements.length;
            var component;
            while(i--) {
                component = new fabric['TextField'](elements[i]);
            }
        }
    }

});

$(document).ready(function () {
    // File Picker demo fixes
    if ($('.ms-FilePicker').length > 0) {
        $('.ms-FilePicker').css({
            "position": "absolute !important"
        });

        $('.ms-Panel').FilePicker();
    } else {
        if ($.fn.NavBar) {
            $('.ms-NavBar').NavBar();
        }
    }

    // Vanilla JS Components
    if (typeof fabric !== "undefined") {
        if ('NavBar' in fabric) {
            var elements = document.querySelectorAll('.ms-NavBar');
            var i = elements.length;
            var component;
            while (i--) {
                component = new fabric['NavBar'](elements[i]);
            }
        }
    }

});

$(document).ready(function () {
    if ($.fn.Dropdown) {
        $('.ms-Dropdown').Dropdown();
    }
});