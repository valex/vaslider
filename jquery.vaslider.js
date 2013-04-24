// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function($, window, document, undefined) {

    "use strict";

    var VASlider = function(element, options)
    {
        // Element
        this.$el = $(element);

        // Options
        this.opts = $.extend({
            preloadImages : 'all'

        }, options);

        // Init
        this.init();
    };

    // Functionality
    VASlider.prototype = {

        // Initialization
        init: function()
        {
            // store the original children
            this.children = this.$el.children();

            // store if the slider is in carousel mode (displaying / moving multiple slides)
            this.carousel = true;
            // if carousel, force preloadImages = 'all'
            if(this.carousel) this.opts.preloadImages = 'all';

            // determine which property to use for transitions
            this.animProp = 'left';




            // wrap el in a wrapper
            this.$el.wrap('<div class="va-wrapper"><div class="va-viewport"></div></div>');
            // store a namespace reference to .va-viewport
            this.viewport = this.$el.parent();
            // add a loading div to display while images are loading
            this.loader = $('<div class="va-loading" />');
            this.viewport.prepend(this.loader);

            // set el to a massive width, to hold any needed slides
            // also strip any margin and padding from el
            this.$el.css({
                width: this.children.length * 2150 + '%',
                position: 'relative'
            });

            // make modifications to the viewport (.va-viewport)
            this.viewport.css({
                width: '100%',
                overflow: 'hidden',
                position: 'relative'
            });
            this.viewport.parent().css({
                maxWidth: '100%'
            });
            // apply css to all slider children
            this.children.css({
                'float': 'left',
                listStyle: 'none',
                position: 'relative'
            });
            // apply the calculated width after the float is applied to prevent scrollbar interference
            this.children.width(this.viewport.width());



            // set the default preload selector (visible)
            var preloadSelector = this.children.eq(0);
            if (this.opts.preloadImages == "all") preloadSelector = this.$el.children();

            // preload all images, then perform final DOM / CSS modifications that depend on images being loaded
            preloadSelector.imagesLoaded($.proxy(this.start, this));
        },

        start:function(){
            // remove the loading DOM element
            this.loader.remove();

            var lastChild = this.children.last();
            var position = lastChild.position();

            var value = -(position.left - (this.viewport.width() - lastChild.width()));
            this.$el.css(this.animProp, value)
            // set the left position
            //setPositionProperty(-(position.left - (slider.viewport.width() - lastChild.width())), 'reset', 0);

            // set the viewport height
            this.viewport.height(this.getViewportHeight());

            // make sure everything is positioned just right (same as a window resize)
            this.$el.redrawSlider();

            console.log(this.getViewportHeight());
        },

        /**
         * Returns the calculated height of the viewport, used to determine either adaptiveHeight or the maxHeight value
         */
        getViewportHeight:function(){
            var height = 0;
            // first determine which children (slides) should be used in our height calculation
            var children = $();

            children = this.children;//.eq();

            height = Math.max.apply(Math, children.map(function(){
                return $(this).outerHeight(false);
            }).get());

            return height;
        }

    };


    jQuery.fn.vaslider = function(option) {
        return this.each(function() {

            var $obj = $(this);

            var data = $obj.data('vaSlider');
            if (!data)
            {
                $obj.data('vaSlider', (data = new VASlider(this, option)));
            }

            console.log($obj.data('vaSlider'));
            //slider.init();
        });
    };

})(jQuery, window, document);

/*!
 * jQuery imagesLoaded plugin v2.1.1
 * http://github.com/desandro/imagesloaded
 *
 * MIT License. by Paul Irish et al.
 */

/*jshint curly: true, eqeqeq: true, noempty: true, strict: true, undef: true, browser: true */
/*global jQuery: false */

(function(c,q){var m="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";c.fn.imagesLoaded=function(f){function n(){var b=c(j),a=c(h);d&&(h.length?d.reject(e,b,a):d.resolve(e));c.isFunction(f)&&f.call(g,e,b,a)}function p(b){k(b.target,"error"===b.type)}function k(b,a){b.src===m||-1!==c.inArray(b,l)||(l.push(b),a?h.push(b):j.push(b),c.data(b,"imagesLoaded",{isBroken:a,src:b.src}),r&&d.notifyWith(c(b),[a,e,c(j),c(h)]),e.length===l.length&&(setTimeout(n),e.unbind(".imagesLoaded",
    p)))}var g=this,d=c.isFunction(c.Deferred)?c.Deferred():0,r=c.isFunction(d.notify),e=g.find("img").add(g.filter("img")),l=[],j=[],h=[];c.isPlainObject(f)&&c.each(f,function(b,a){if("callback"===b)f=a;else if(d)d[b](a)});e.length?e.bind("load.imagesLoaded error.imagesLoaded",p).each(function(b,a){var d=a.src,e=c.data(a,"imagesLoaded");if(e&&e.src===d)k(a,e.isBroken);else if(a.complete&&a.naturalWidth!==q)k(a,0===a.naturalWidth||0===a.naturalHeight);else if(a.readyState||a.complete)a.src=m,a.src=d}):
    n();return d?d.promise(g):g}})(jQuery);

//@TODO simply horizontal scroll first

