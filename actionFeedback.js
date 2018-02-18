function ActionFeedBack($element, $options){
	this.options = $.extend({}, ActionFeedBack.DEFAULTS, $options)		
	this.element = $($element) || $(document.body);
	this.eventHandler = 'click';

	this.setListener();
}

ActionFeedBack.DEFAULTS = {
	lockEvent: false,
	prefix: 'feedback',
	timeout: 1000,
	offset: 15
};

ActionFeedBack.prototype = {
	setListener: function(){
		console.log( this.element)
		var t = this;
		this.element.on(this.eventHandler, function(event){
			console.log('click')
			var self = $(this);
			if (t.options.lockEvent && self.data('feedback-loading') == true) {
				return; // do nothing, bubble away
			}
			
			t.toggleFeedback(self, event, true, t.options.offset);
			
			if($.support.transition){
				self.one('bsTransitionEnd', function () {
					t.toggleFeedback(self, event, false, t.options.offset);
				}).emulateTransitionEnd(t.options.timeout);
			}else{
				setTimeout(function(){
					t.toggleFeedback(self, event, false,  t.options.offset);
				}, (t.options.timeout))
			}
		});
	},
	toggleFeedback: function(element, event, $state, $offset){
		var position = this.getEventPosition(event, $offset);
		if($state){
			this.createFeedBackElement(Math.round(position.timestamp), position.x, position.y);
			element.data(ActionFeedBack.DEFAULTS.prefix+'-loading', $state);
			element.attr('aria-pressed', $state);
		}else{
			element.removeClass(this.options.prefix+'-active');
			element.attr('aria-pressed', false);
			element.data(ActionFeedBack.DEFAULTS.prefix+'-loading', false);
			this.removeFeedBackElement(Math.round(position.timestamp));
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
	createFeedBackElement: function(timestamp, $x, $y){
		var clickArea = document.createElement('div');
		var objBody = $(document.body);

		clickArea.setAttribute('id', 'event'+ActionFeedBack.DEFAULTS.prefix+timestamp);
		clickArea.setAttribute('data-click-'+this.options.prefix, '');
		clickArea.setAttribute('class', this.options.prefix+'-active');

		objBody.append(clickArea);

		return this.setPosition($(clickArea), $x, $y);
	},
	removeFeedBackElement: function(timestamp){
		return document.getElementById('event'+ActionFeedBack.DEFAULTS.prefix+timestamp).remove();
	}
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
			var data    = self.data('actionFeedback');
			var options = $.extend({}, ActionFeedBack.DEFAULTS, self.data(), typeof $option == "object" && $option);

			if (!data) {
				self.data('actionFeedback', (data = new ActionFeedBack(this, options)));
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

}(jQuery);
