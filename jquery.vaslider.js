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
            // GENERAL
            preloadImages : 'all',
            speed: 500,
            startSlide: 0,

            // AUTO
            pause: 4000,
            autoDirection: 'next'
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

            // store active slide information
            this.active = { index: this.opts.startSlide }
            // store if the slider is in carousel mode (displaying / moving multiple slides)
            this.carousel = true;
            // if carousel, force preloadImages = 'all'
            if(this.carousel) this.opts.preloadImages = 'all';

            // store the current state of the slider (if currently animating, working is true)
            this.working = false;

            // initialize an auto interval
            this.interval = null;
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
                position: 'relative',
                margin:0,
                padding:0
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
            this.children.width(this.getSlideWidth());


            // if infinite loop, prepare additional slides
            var slice = this.children.length;
            var sliceAppend = this.children.slice(0, slice).clone().addClass('va-clone');
            var slicePrepend = this.children.slice(-slice).clone().addClass('va-clone');
            this.$el.append(sliceAppend).prepend(slicePrepend);


            // check if startSlide is last slide
            this.active.last = this.opts.startSlide == this.getPagerQty() - 1;

            // set the default preload selector (visible)
            var preloadSelector = this.children.eq(0);
            if (this.opts.preloadImages == "all") preloadSelector = this.$el.children();

            // preload all images, then perform final DOM / CSS modifications that depend on images being loaded
            preloadSelector.imagesLoaded($.proxy(this.start, this));
        },

        start:function(){
            // remove the loading DOM element
            this.loader.remove();

            this.setSlidePosition();


            // set the viewport height
            this.viewport.height(this.getViewportHeight());

            // make sure everything is positioned just right (same as a window resize)
            this.redrawSlider();

            // slider has been fully initialized
            this.initialized = true;

            this.initAuto();
            //console.log(this.getViewportHeight());
        },


        /**
         * Initialzes the auto process
         */
        initAuto:function(){
            // if autoDelay was supplied, launch the auto show using a setTimeout() call
            //if(slider.settings.autoDelay > 0){
            //    var timeout = setTimeout(el.startAuto, slider.settings.autoDelay);
                // if autoDelay was not supplied, start the auto show normally
            //}else{
                this.startAuto();
            //}
            // if autoHover is requested
            /*
            if(slider.settings.autoHover){
                // on el hover
                el.hover(function(){
                    // if the auto show is currently playing (has an active interval)
                    if(slider.interval){
                        // stop the auto show and pass true agument which will prevent control update
                        el.stopAuto(true);
                        // create a new autoPaused value which will be used by the relative "mouseout" event
                        slider.autoPaused = true;
                    }
                }, function(){
                    // if the autoPaused value was created be the prior "mouseover" event
                    if(slider.autoPaused){
                        // start the auto show and pass true agument which will prevent control update
                        el.startAuto(true);
                        // reset the autoPaused value
                        slider.autoPaused = null;
                    }
                });
            }
            */
        },

        /**
         * Starts the auto show
         *
         * @param preventControlUpdate (boolean)
         *  - if true, auto controls state will not be updated
         */
        startAuto:function(preventControlUpdate){
            // if an interval already exists, disregard call
            if(this.interval) return;
            // create an interval
            this.interval = setInterval($.proxy(function(){
                this.opts.autoDirection == 'next' ? this.goToNextSlide() : this.goToPrevSlide();
            }, this), this.opts.pause);
            // if auto controls are displayed and preventControlUpdate is not true
            //if (slider.settings.autoControls && preventControlUpdate != true) updateAutoControls('stop');
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
        },

        getSlideWidth:function(){
            return this.viewport.width();
        },

        /**
         * Transitions to the next slide in the show
         */
        goToNextSlide:function(){
            // if infiniteLoop is false and last page is showing, disregard call
            var pagerIndex = parseInt(this.active.index) + 1;
            this.goToSlide(pagerIndex, 'next');
        },

        /**
         * Transitions to the prev slide in the show
         */
        goToPrevSlide:function(){
            // if infiniteLoop is false and last page is showing, disregard call
            //if (!slider.settings.infiniteLoop && slider.active.index == 0) return;
            //var pagerIndex = parseInt(slider.active.index) - 1;
            //el.goToSlide(pagerIndex, 'prev');
        },

        /**
         * ===================================================================================
         * = PUBLIC FUNCTIONS
         * ===================================================================================
         */

        /**
         * Performs slide transition to the specified slide
         *
         * @param slideIndex (int)
         *  - the destination slide's index (zero-based)
         *
         * @param direction (string)
         *  - INTERNAL USE ONLY - the direction of travel ("prev" / "next")
         */
        goToSlide:function(slideIndex, direction){
            // if plugin is currently in motion, ignore request
            if(this.working || this.active.index == slideIndex) return;
            // declare that plugin is in motion
            this.working = true;
            // store the old index
            this.oldIndex = this.active.index;
            // if slideIndex is less than zero, set active index to last child (this happens during infinite loop)
            if(slideIndex < 0){
                this.active.index = this.getPagerQty() - 1;
                // if slideIndex is greater than children length, set active index to 0 (this happens during infinite loop)
            }else if(slideIndex >= this.getPagerQty()){
                this.active.index = 0;
                // set active index to requested slide
            }else{
                this.active.index = slideIndex;
            }

            // check if last slide
            this.active.last = this.active.index >= this.getPagerQty() - 1;

            var moveBy = 0;
            var position = {left: 0, top: 0};

            // horizontal carousel, going previous while on first slide (infiniteLoop mode)
            if(this.carousel && this.active.last && direction == 'prev'){
                // get the last child position
                //var eq = slider.settings.moveSlides == 1 ? slider.settings.maxSlides - getMoveBy() : ((getPagerQty() - 1) * getMoveBy()) - (slider.children.length - slider.settings.maxSlides);
                //var lastChild = el.children('.bx-clone').eq(eq);
                //position = lastChild.position();
                // if infinite loop and "Next" is clicked on the last slide
            }else if(direction == 'next' && this.active.index == 0){
                // get the last clone position
                position = this.$el.find('> .va-clone').eq(1).position();
                this.active.last = false;
                // normal non-zero requests
            }else if(slideIndex >= 0){
                position = this.children.eq(slideIndex).position();
            }

            /* If the position doesn't exist
             * (e.g. if you destroy the slider on a next click),
             * it doesn't throw an error.
             */
            if ("undefined" !== typeof(position)) {
                var value = -(position.left - moveBy);
                // plugin values to be animated
                this.setPositionProperty(value, 'slide', this.opts.speed);
            }

            console.log(position);

            this.working = false;
        },

        /**
         * Returns the number of pages (one full viewport of slides is one "page")
         */
        getPagerQty:function(){
            var pagerQty = 0;
            /*
            // if moveSlides is specified by the user
            if(slider.settings.moveSlides > 0){
                if(slider.settings.infiniteLoop){
                    pagerQty = slider.children.length / getMoveBy();
                }else{
                    // use a while loop to determine pages
                    var breakPoint = 0;
                    var counter = 0
                    // when breakpoint goes above children length, counter is the number of pages
                    while (breakPoint < slider.children.length){
                        ++pagerQty;
                        breakPoint = counter + getNumberSlidesShowing();
                        counter += slider.settings.moveSlides <= getNumberSlidesShowing() ? slider.settings.moveSlides : getNumberSlidesShowing();
                    }
                }
                // if moveSlides is 0 (auto) divide children length by sides showing, then round up
            }else{
                pagerQty = Math.ceil(slider.children.length / getNumberSlidesShowing());
            }
            return pagerQty;
            */
            return this.children.length;
        },

        setSlidePosition:function(){
            // get the position of the first showing slide
            var position = this.children.eq(this.active.index).position();

            // check for last slide
            if (this.active.index == this.getPagerQty() - 1) this.active.last = true;

            // set the repective position
            if (position != undefined){
                this.setPositionProperty(-position.left, 'reset', 0);
            }
        },

        setPositionProperty:function(value, type, duration, params){
            var animateObj = {};
            animateObj[this.animProp] = value;
            if(type == 'slide'){
                this.$el.animate(animateObj, duration, 'linear', function(){
                    //updateAfterSlideTransition();
                });
            }else if(type == 'reset'){
                this.$el.css(this.animProp, value)
            }
        },

        /**
         * Update all dynamic slider elements
         */
        redrawSlider:function(){


            // resize all children in ratio to new screen size
            this.children.add(this.$el.find('.va-clone')).width(this.getSlideWidth());

            // adjust the height
            this.viewport.css('height', this.getViewportHeight());

            // update the slide position
            this.setSlidePosition();
            /*
            if(!slider.settings.ticker) setSlidePosition();
            // if active.last was true before the screen resize, we want
            // to keep it last no matter what screen size we end on
            if (slider.active.last) slider.active.index = getPagerQty() - 1;
            // if the active index (page) no longer exists due to the resize, simply set the index as last
            if (slider.active.index >= getPagerQty()) slider.active.last = true;
            // if a pager is being displayed and a custom pager is not being used, update it
            if(slider.settings.pager && !slider.settings.pagerCustom){
            populatePager();
            updatePagerActive(slider.active.index);
            }

            */
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

