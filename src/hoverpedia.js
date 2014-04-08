var hoveringOverLink = false;

var hoverBox = {

    classes: {
        box: '.hoverpediabox',
        noOverflowDiv: '.hoverpediabox_noverflow',
        loadingImg: '.hoverpediabox_loading'
    },

    startHTML: '<div class="hoverpediabox arrow_box">' +
                    '<div class="hoverpediabox_noverflow">' +
                        '<img class="hoverpediabox_loading" alt="Loading Wiki...">'+
                        '<h2></h2>' +
                        '<p>',

    endHTML:            '</p>' +
                    '</div>' +
                '</div>',


    html: this.startHTML + this.endHTML,

    /**
     * Sets the title of the popup
     * Currently unused
     * TODO: Make this an option
     * @param title
     */
    setTitle: function(title) {
        var h2 = $(this.classes.box + ' > ' + this.classes.noOverflowDiv + ' > h2');
        h2.text(title);
        h2.show();
    },

    /**
     * Sets the inner HTML of the box
     * @param html
     */
    setHTML: function(html) {
        $(this.classes.box + ' > ' + this.classes.noOverflowDiv + ' > p').html(html);
    },

    /**
     * Displays the loading gif
     * Currently unusued
     */
    showLoading: function() {
        var img = $(this.classes.loadingImg);
        var src = chrome.extension.getURL('/loading.gif');
        img.attr('src', src);
        img.show();
    },

    /**
     * Hides the loading gif
     */
    hideLoading: function() {
        $(this.classes.loadingImg).hide();
    },

    /**
     * Injects the HTML necessary to display the popup box
     */
    appendBoxToBody: function () {
        if (this.element === null) {
            $('body').append(this.startHTML + this.endHTML);
        }
    },

    /**
     * Injects the HTML and Creates the jquery element for the popup box
     */
    initialiseHoverBoxElement: function() {
        this.appendBoxToBody();
        this.element = $(this.classes.box);
    },

    element: null,

    /**
     * Sets the x,y position of the popup box
     * @param x
     * @param y
     */
    setPosition: function(x, y) {

        var boxWidth = hoverBox.element.outerWidth();
        var boxHeight = hoverBox.element.outerHeight();
        var top = y - boxHeight - 30;
        var left = x - boxWidth / 2;

        if (left < 0) {
            left = 0;
        }

        this.element.css(
            {
                top: top,
                left: left
            }
        );
    }
};

/**
 * Returns the Title and the first paragraph, shortened to fit within charLimit
 * @param data Data in form of HTML
 * @param charLimit The character limit to display in the popup box
 * @returns {{title: string, paragraph: string }}
 */
function getTitleAndParagraph(data, charLimit) {

    var el = $('<div></div>'); //create dummy element
    el.html(data);

    var firstPTag = $('#mw-content-text > p', el).first();
    var title = $('#firstHeading', el).text();

    var firstParagraph = {
        html: firstPTag.html(),
        text: firstPTag.text()
    };

    function getSliceLimitInHTMLFormUsingTextForm() {
        var trimmedSentence = firstParagraph.text.slice(0, charLimit);
        var lastTenChars = trimmedSentence.slice(trimmedSentence.length - 10, trimmedSentence.length);

        return firstParagraph.html.indexOf(lastTenChars);
    }

    var sliceLimit = getSliceLimitInHTMLFormUsingTextForm();

    return {
        title: title,
        paragraph: firstParagraph.html.slice(0, sliceLimit)
    };
}

/**
 * Creates an AJAX request to Wikipedia to fetch requested page title
 * @param pageTitle
 * @param event The hover event, required to set box position to mouse position
 */
function fetchWiki(pageTitle, event) {

    var charLimit = 400;
    $.get(pageTitle,
        function(data) {
            var result = getTitleAndParagraph(data, charLimit);
            hoverBox.setHTML(result.paragraph + "...");
            hoveringOverLink = true;
        }
    );
}

/**
 * Controls mousing over a wiki link
 * @param $this
 */
var mouseOverWikiLink = function($this) {
    var href = $this.attr('href');

    if (href.match(/(\/wiki\/|%2Fwiki)/) !== null) {
        fetchWiki(href, $this);
    }

};

/**
 * Controls mousing off a wiki link
 */
var mouseLeaveWikiLink = function() {
    hoveringOverLink = false;
};

/**
 * When document is ready
 */
$( function() {
    var a = $('a');

    hoverBox.initialiseHoverBoxElement();

    /**
     * hoverIntent is a delayed version of hover, provided by plugin
     * It waits for the mouse to be nearly stationary before activating
     */
    a.hoverIntent(
        function() {
            mouseOverWikiLink($(this));
        },
        function() {
            mouseLeaveWikiLink();
        }
    );


    /**
     * Sets the popup box to the mouse cursor position every time mouse is moved
     */
    $("body").mousemove(function(e) {
        hoverBox.setPosition(e.pageX, e.pageY);

        if (hoveringOverLink) {
            hoverBox.element.show();
        } else {
            hoverBox.element.hide();
        }
    });

});