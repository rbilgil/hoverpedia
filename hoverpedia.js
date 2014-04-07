var hoverBox = {
    html: '<div id="hoverpediabox" class="arrow_box">Loading...</div>',
    element: null,
    setPosition: function(anchor) {

        var offset = anchor.offset();
        var aWidth = anchor.width();
        var boxWidth = hoverBox.element.width();
        var boxHeight = hoverBox.element.height();

        this.element.css(
            {
                top: offset.top - boxHeight - 180,
                left: offset.left - boxWidth + aWidth/2
            }
        );
    }
};

function fetchWiki(pageTitle, anchor) {

    var charLimit = 250;

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
            hoverBox.element.html(slicedHTML + "...");
            hoverBox.setPosition(anchor);
        }
    );
}

var mouseOverWikiLink = function($this) {
    var href = $this.attr('href');

    if (href.match(/wiki/) !== null) {
        $this.after(hoverBox.html);
        hoverBox.element = $('#hoverpediabox');
        hoverBox.setPosition($this);
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
