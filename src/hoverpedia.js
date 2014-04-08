var hoveringOverLink = false;

var hoverBox = {
    startHTML: '<div class="hoverpediabox arrow_box">' +
                    '<div class="noverflow">' +
                        '<h2></h2>' +
                        '<p>',

    endHTML:            '</p>' +
                    '</div>' +
                '</div>',

    html: this.startHTML + this.endHTML,

    setTitle: function(title) {
        $('.hoverpediabox > .noverflow > h2').text(title);
    },

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

            hoverBox.setTitle(result.title);
            hoverBox.setHTML(result.paragraph + "...");
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