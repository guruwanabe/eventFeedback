function ActionFeedBack($element, $options){
  this.options = $.extend( {}, ActionFeedBack.prototype.DEFAULTS, $options)		
  this.element = $($element) || $(document.body);
  this.timeout = $timeout || ($timeout = 1000);
  this.eventHandler = 'click';
  this.setListener();
}

ActionFeedBack.prototype = {
	DEFAULTS: {
		lockEvent: false,
		feedBackClass: 'feedback'
	}.
	setListener: function($timeout){
		this.element.on(this.eventHandler, function(event){
			var self = $(this);
			if (this.options.lockEvent && t.data('feedback-loading') == true) {
                return; // do nothing, bubble away
            }
			this.toggleFeedback(self, event, true);
			if($.support.transition){
				self.one('bsTransitionEnd', function () {
				    toggleFeedback(self, event, false);
				}).emulateTransitionEnd(this.timeout);
			}else{
				setTimeout(function(){
				   toggleFeedback(self, event, false);
				}, (this.timeout))
			}
		});
	},
	toggleFeedback: function(element, event, $state){
		var position = getEventPosition(event, 15);
		if($state){
		    this.createFeedBackElement(position.timestamp);
		    element.data('feedback-loading', $state);
		    element.attr('aria-pressed', $state);
		}else{
		    element.removeClass(this.options.feedBackClass+'-active');
		    element.attr('aria-pressed', false);
		    element.data('feedback-loading', false);
		    this.removeFeedBackElement(position.timestamp);
		}
	},
	setPosition: function(el, $x, $y){
		return el.css({
		    'top': $y,
		    'left':$x,
		    'width': 50,
		    'height': 50,
		    'position': 'absolute',
		    'z-index': 1060
		})
	},
	getEventPosition: function($event, $offset) {
	    $offset = ($offset || 0);
	    var event = $event;
	    return {
			x: (event.pageX) - $offset,
			y: (event.pageY) - $offset,
			timestamp: event.timeStamp
	    }
	}, 
	createFeedBackElement: function(timestamp){
		var clickArea = document.createElement('div');
		clickArea.setAttribute('id', timestamp);
		clickArea.setAttribute('data-click-feedback', '');
		clickArea.setAttribute('class', this.options.feedBackClass+'-active');

		objBody.append(clickArea);

		return setPosition($(clickArea), position.x, position.y);
	},
	removeFeedBackElement: function(timestamp){
		return document.getElementById(timestamp).remove();
	}


	// CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
	// ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap')

        var transEndEventNames = {
            WebkitTransition : 'webkitTransitionEnd',
            MozTransition    : 'transitionend',
            OTransition      : 'oTransitionEnd otransitionend',
            transition       : 'transitionend'
        }

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return { end: transEndEventNames[name] }
            }
        }

        return false // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function (duration) {
        var called = false;
        var $el = this;
        $(this).one('bsTransitionEnd', function () { called = true });
        var callback = function () { if (!called) $($el).trigger($.support.transition.end) };
        setTimeout(callback, duration);
        return this
    };

    $(function () {
        $.support.transition = transitionEnd();

        if (!$.support.transition) return;

        $.event.special.bsTransitionEnd = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function (e) {
                if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
            }
        }
    })
};

+function ($) {
	"use strict";
	/**
	 * Plugin
	 *
	 * @param $option {object || string}
	 * @return function
	 *
	 * =======================
	 */
	function Plugin($option) {
		return this.each(function () {
			var self    = $(this);
			var data    = self.data("feedback-loading");
			var options = $.extend({}, ActionFeedBack.prototype.DEFAULTS, self.data(), typeof $option == "object" && $option);

			if (!data) {
				self.data("feedback-loading", (data = new ActionFeedBack(this, options)));
			}
			if (typeof $option == "string"){
				data[options]($option);
			}
		});
	}

	var old = $.fn.actionFeedback;

	$.fn.actionFeedback             = Plugin;
	$.fn.actionFeedback.Constructor = ActionFeedBack;

	/**
	 * actionFeedback No Conflict
	 *
	 * @return object
	 *
	 * =======================
	 */
	$.fn.actionFeedback.noConflict = function () {
		$.fn.actionFeedback = old;
		return this;
	};

}(jQuery);
