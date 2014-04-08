var hoveringOverLink = false;

var hoverBox = {
    startHTML: '<div class="hoverpediabox arrow_box">' +
                    '<div class="noverflow">' +
                        '<p>',

    endHTML:            '</p>' +
                    '</div>' +
                '</div>',

    html: this.startHTML + this.endHTML,

    setHTML: function(html) {
        $('.hoverpediabox > .noverflow > p').html(html);
    },

    appendBoxToBody: function () {
        if (this.element === null) {
            $('body').append(this.startHTML + this.endHTML);
        }
    },

    initialiseHoverBoxElement: function() {
        this.appendBoxToBody();
        this.element = $('.hoverpediabox');
    },

    element: null,

    setPosition: function(x, y) {

        var boxWidth = hoverBox.element.width();
        var boxHeight = hoverBox.element.height();

        this.element.css(
            {
                top: y - boxHeight - 45,
                left: x - boxWidth / 2
            }
        );
    }
};

function getSlicedHTMLFromWikiPage(data, charLimit) {

    var el = $('<div></div>'); //create dummy element
    el.html(data);

    var firstPTag = $('#mw-content-text > p', el).first();

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

    return firstParagraph.html.slice(0, sliceLimit);
}

function fetchWiki(pageTitle, event) {

    var charLimit = 400;

    $.get(pageTitle,
        function(data) {
            var slicedHTML = getSlicedHTMLFromWikiPage(data, charLimit);
            hoverBox.setHTML(slicedHTML + "...");
            hoverBox.setPosition(event.pageX, event.pageY);
        }
    );
}

var mouseOverWikiLink = function($this) {
    var href = $this.attr('href');

    if (href.match(/wiki/) !== null) {
        hoveringOverLink = true;
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
            a.css('position', 'relative');
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