var hoverBox = {
    html: null,
    setHTML: function(html) {
        this.html =
            '<div class="hoverpediabox arrow_box">' +
                '<div class="noverflow">' +
                    '<p>' +
                        html +
                    '</p>' +
                '</div>' +
            '</div>';
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

function fetchWiki(pageTitle, event) {

    var charLimit = 400;

    $.get(pageTitle,
        function(data) {
            var el = $( '<div></div>' );
            el.html(data);
            var firstP = $('#mw-content-text > p', el).first();
            var firstParagraph = {
                html: firstP.html(),
                text: firstP.text()
            };

            var trimmedSentence = firstParagraph.text.slice(0, charLimit);

            var lastFewChars = trimmedSentence.slice(trimmedSentence.length - 10, trimmedSentence.length);
            var sliceLimit = firstParagraph.html.indexOf(lastFewChars);
            var slicedHTML = firstParagraph.html.slice(0, sliceLimit);
            hoverBox.setHTML(slicedHTML + "...");
            $('body').after(hoverBox.html);
            hoverBox.element = $('.hoverpediabox');
            hoverBox.setPosition(event.pageX, event.pageY);
        }
    );
}

var mouseOverWikiLink = function($this) {
    var href = $this.attr('href');

    if (href.match(/wiki/) !== null) {
        fetchWiki(href, $this);

    }

};

var mouseLeaveWikiLink = function() {
    if (hoverBox.element !== null) {
        hoverBox.element.remove();
    }
};

$( function() {

    var a = $('a');

    a.hoverIntent(
        function() {
            a.css('position', 'relative');
            mouseOverWikiLink($(this));
        },
        function(event) {
            if ($(event.target) != hoverBox.element) {
                mouseLeaveWikiLink();
            }
        }
    );

});

$("body").mousemove(function(e) {
    if (hoverBox.element !== null) {
        hoverBox.setPosition(e.pageX, e.pageY);
    }
});
