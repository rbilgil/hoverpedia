var hoveringOverLink = false;

var hoverBox = {

    classes: {
        box: '.hoverpediabox',
        noOverflowDiv: '.hoverpediabox_noverflow',
        loadingImg: '.hoverpediabox_loading'
    },

    ids: {
        top: '#hoverpedia_top',
        left: '#hoverpedia_left',
        right: '#hoverpedia_right',
        bottom: '#hoverpedia_bottom'
    },

    startHTML: function(id) {
        return '<div class="hoverpediabox arrow_box" id="' + id + '">' +
                    '<div class="hoverpediabox_noverflow">' +
                    '<img class="hoverpediabox_loading" alt="Loading Wiki...">'+
                    '<h2></h2>' +
                    '<p>';
    },

    endHTML:            '</p>' +
                    '</div>' +
                '</div>',

    html: {
        top: function() {
            return hoverBox.startHTML('hoverpedia_top') + hoverBox.endHTML;
        },
        left: function() {
            return hoverBox.startHTML('hoverpedia_left') + hoverBox.endHTML;
        },
        right: function() {
            return hoverBox.startHTML('hoverpedia_right') + hoverBox.endHTML;
        },
        bottom: function() {
            return hoverBox.startHTML('hoverpedia_bottom') + hoverBox.endHTML;
        },
    },

    /**
     * Sets the inner HTML of the box
     * @param html
     */
    setHTML: function(html) {
        $(this.classes.box + ' > ' + this.classes.noOverflowDiv + ' > p').html(html);
    },

    /**
     * Injects the HTML necessary to display the popup box
     */
    appendBoxToBody: function () {
        if (this.element_Top === null) {
            $('body').append(this.html.top())
                     .append(this.html.left())
                     .append(this.html.right())
                     .append(this.html.bottom());
        }
    },

    /**
     * Injects the HTML and Creates the jquery element for the popup box
     */
    initialiseHoverBoxElement: function() {
        this.appendBoxToBody();
        this.element_Top = $(this.ids.top);
        this.element_Left = $(this.ids.left);
        this.element_Right = $(this.ids.right);
        this.element_Bottom = $(this.ids.bottom);
    },

    element_Top: null,
    element_Right: null,
    element_Left: null,
    element_Bottom: null,

    showElement: function(x, y) {
        var boxWidth = hoverBox.element_Top.outerWidth();
        var boxHeight = hoverBox.element_Top.outerHeight();
        var wind = $(window);


        if (x - boxWidth / 2 < 0) {
            hoverBox.hideElements();
            hoverBox.element_Right.show();
        } else if (x + boxWidth / 2 > wind.width()) {
            hoverBox.hideElements();
            hoverBox.element_Left.show();
        } else if (y - boxHeight - 30 < wind.scrollTop()) {
            hoverBox.hideElements();
            hoverBox.element_Bottom.show();
        } else {
            hoverBox.hideElements();
            hoverBox.element_Top.show();
        }
    },

    hideElements: function() {
        hoverBox.element_Right.hide();
        hoverBox.element_Left.hide();
        hoverBox.element_Top.hide();
        hoverBox.element_Bottom.hide();
    },

    /**
     * Sets the x,y position of the popup box
     * @param x
     * @param y
     */
    setPosition: function(x, y) {

        var boxWidth = hoverBox.element_Top.outerWidth();
        var boxHeight = hoverBox.element_Top.outerHeight();

        var top = {
            box: y - boxHeight - 30,
            bottomBox: y + 30,
            leftBox: y - boxHeight / 2,
            rightBox: y - boxHeight / 2
        };

        var left = {
            box: x - boxWidth / 2,
            bottomBox: x - boxWidth / 2,
            leftBox: x - boxWidth - 30,
            rightBox: x + 30
        };

        this.element_Top.css(
            {
                top: top.box,
                left: left.box
            }
        );

        this.element_Right.css(
            {
                top: top.rightBox,
                left: left.rightBox
            }
        );

        this.element_Left.css(
            {
                top: top.leftBox,
                left: left.leftBox
            }
        );

        this.element_Bottom.css(
            {
                top: top.bottomBox,
                left: left.bottomBox
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

    var P = $('#mw-content-text > p', el).first();

    if (P.text().match('Coordinates') !== null) {
        P = $('#mw-content-text > p', el).eq(1);
    }

    var title = $('#firstHeading', el).text();

    var paragraph = {
        html: P.html(),
        text: P.text()
    };

    if (paragraph.html == null || paragraph.html == undefined || paragraph.html == "") {
        paragraph.html = "Can't find any content to fetch on this page";
    }

    return {
        title: title,
        paragraph: paragraph.html
    };
}

/**
 * Creates an AJAX request to Wikipedia to fetch requested page title
 * @param pageTitle
 */
function fetchWiki(pageTitle) {

    var charLimit = 400;
    $.get(pageTitle,
        function(data) {
            var result = getTitleAndParagraph(data, charLimit);
            hoverBox.setHTML(result.paragraph);
            hoveringOverLink = true;
        }
    );
}

function isWikiLink(href) {
    return href === undefined ? false :
        href.match(/(wikipedia\.org\/wiki\/|wikipedia\.org%2Fwiki)/) !== null
        || (window.location.href.match(/wikipedia/) && href.match(/\/wiki\//) !== null);
}
/**
 * Controls mousing over a wiki link
 * @param anchor
 */
var mouseOverWikiLink = function(anchor) {
    var href = anchor.attr('href');

    if (isWikiLink(href)) {
        fetchWiki(href);
    }

};

/**
 * Controls mousing off a wiki link
 */
var mouseLeaveWikiLink = function(anchor) {
    hoveringOverLink = false;
    removeAnchorOutlines(anchor);
};

function outlineWikiAnchors(anchor) {
    var href = anchor.attr('href');
    if (isWikiLink(href)) {
        anchor.css('outline', '2px dashed #ff6406');
    }
}

function removeAnchorOutlines(anchor) {
    anchor.css('outline', 'none');
}
/**
 * When document is ready
 */
$( function() {
    var a = $('a');

    a.each(function(index) {
        var anchor = $(this);
        var href = anchor.attr('href');

        if (window.location.href.match(/wikipedia\.org/) === null) {
            outlineWikiAnchors(anchor);
        }
    });

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
            mouseLeaveWikiLink($(this));
        }
    );

    //To put an outline on the link as soon as mouse is over it, to indicate it's a "hoverpedia" link
    a.hover(
        function() {
            var $this = $(this);
            outlineWikiAnchors($this);
        },
        function() {
            mouseLeaveWikiLink($(this));
        }
    );


    /**
     * Sets the popup box to the mouse cursor position every time mouse is moved
     */
    $("body").mousemove(function(e) {
        hoverBox.setPosition(e.pageX, e.pageY);

        if (hoveringOverLink) {
            hoverBox.showElement(e.pageX, e.pageY);

        } else {
            hoverBox.hideElements();
        }
    });

});