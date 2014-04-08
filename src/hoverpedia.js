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

    setTitle: function(title) {
        var h2 = $(this.classes.box + ' > ' + this.classes.noOverflowDiv + ' > h2');
        h2.text(title);
        h2.show();
    },

    setHTML: function(html) {
        $(this.classes.box + ' > ' + this.classes.noOverflowDiv + ' > p').html(html);
    },

    setLoading: function() {
        var img = $(this.classes.loadingImg);
        var src = chrome.extension.getURL('/loading.gif');
        img.attr('src', src);
        img.show();
    },

    unsetLoading: function() {
        $(this.classes.loadingImg).hide();
    },

    appendBoxToBody: function () {
        if (this.element === null) {
            $('body').append(this.startHTML + this.endHTML);
        }
    },

    initialiseHoverBoxElement: function() {
        this.appendBoxToBody();
        this.element = $(this.classes.box);
    },

    element: null,

    setPosition: function(x, y) {

        var boxWidth = hoverBox.element.outerWidth();
        var boxHeight = hoverBox.element.outerHeight();

        this.element.css(
            {
                top: y - boxHeight - 30,
                left: x - boxWidth / 2
            }
        );
    }
};

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

function fetchWiki(pageTitle, event) {

    var charLimit = 400;
    $.get(pageTitle,
        function(data) {
            var result = getTitleAndParagraph(data, charLimit);
            hoverBox.setHTML(result.paragraph + "...");
            hoverBox.setPosition(event.pageX, event.pageY);
            hoveringOverLink = true;
        }
    );
}

var mouseOverWikiLink = function($this) {
    var href = $this.attr('href');

    if (href.match(/(\/wiki\/|%2Fwiki)/) !== null) {
        fetchWiki(href, $this);
    }

};

var mouseLeaveWikiLink = function() {
    hoveringOverLink = false;
};

$( function() {
    var a = $('a');

    hoverBox.initialiseHoverBoxElement();

    a.hoverIntent(
        function() {
            mouseOverWikiLink($(this));
        },
        function() {
            mouseLeaveWikiLink();
        }
    );


    $("body").mousemove(function(e) {
        hoverBox.setPosition(e.pageX, e.pageY);

        if (hoveringOverLink) {
            hoverBox.element.show();
        } else {
            hoverBox.element.hide();
        }
    });


});