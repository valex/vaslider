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

            // wrap el in a wrapper
            this.$el.wrap('<div class="va-wrapper"><div class="va-viewport"></div></div>');
            // store a namespace reference to .va-viewport
            this.viewport = this.$el.parent();


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

//@TODO simply horizontal scroll first

