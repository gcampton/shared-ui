(function ($) {

	$('.sui-accordion-item').each(function () {

		$('.sui-accordion-item').on('click', function () {
			$(this).toggleClass('sui-accordion-item--open');
		});

	});

}(jQuery));

/*!
 * clipboard.js v1.7.1
 * https://zenorocha.github.io/clipboard.js
 *
 * Licensed MIT © Zeno Rocha
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Clipboard = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var DOCUMENT_NODE_TYPE = 9;

/**
 * A polyfill for Element.matches()
 */
if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
        if (typeof element.matches === 'function' &&
            element.matches(selector)) {
          return element;
        }
        element = element.parentNode;
    }
}

module.exports = closest;

},{}],2:[function(require,module,exports){
var closest = require('./closest');

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;

},{"./closest":1}],3:[function(require,module,exports){
/**
 * Check if argument is a HTML element.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.node = function(value) {
    return value !== undefined
        && value instanceof HTMLElement
        && value.nodeType === 1;
};

/**
 * Check if argument is a list of HTML elements.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.nodeList = function(value) {
    var type = Object.prototype.toString.call(value);

    return value !== undefined
        && (type === '[object NodeList]' || type === '[object HTMLCollection]')
        && ('length' in value)
        && (value.length === 0 || exports.node(value[0]));
};

/**
 * Check if argument is a string.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.string = function(value) {
    return typeof value === 'string'
        || value instanceof String;
};

/**
 * Check if argument is a function.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.fn = function(value) {
    var type = Object.prototype.toString.call(value);

    return type === '[object Function]';
};

},{}],4:[function(require,module,exports){
var is = require('./is');
var delegate = require('delegate');

/**
 * Validates all params and calls the right
 * listener function based on its target type.
 *
 * @param {String|HTMLElement|HTMLCollection|NodeList} target
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listen(target, type, callback) {
    if (!target && !type && !callback) {
        throw new Error('Missing required arguments');
    }

    if (!is.string(type)) {
        throw new TypeError('Second argument must be a String');
    }

    if (!is.fn(callback)) {
        throw new TypeError('Third argument must be a Function');
    }

    if (is.node(target)) {
        return listenNode(target, type, callback);
    }
    else if (is.nodeList(target)) {
        return listenNodeList(target, type, callback);
    }
    else if (is.string(target)) {
        return listenSelector(target, type, callback);
    }
    else {
        throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
    }
}

/**
 * Adds an event listener to a HTML element
 * and returns a remove listener function.
 *
 * @param {HTMLElement} node
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNode(node, type, callback) {
    node.addEventListener(type, callback);

    return {
        destroy: function() {
            node.removeEventListener(type, callback);
        }
    }
}

/**
 * Add an event listener to a list of HTML elements
 * and returns a remove listener function.
 *
 * @param {NodeList|HTMLCollection} nodeList
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNodeList(nodeList, type, callback) {
    Array.prototype.forEach.call(nodeList, function(node) {
        node.addEventListener(type, callback);
    });

    return {
        destroy: function() {
            Array.prototype.forEach.call(nodeList, function(node) {
                node.removeEventListener(type, callback);
            });
        }
    }
}

/**
 * Add an event listener to a selector
 * and returns a remove listener function.
 *
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenSelector(selector, type, callback) {
    return delegate(document.body, selector, type, callback);
}

module.exports = listen;

},{"./is":3,"delegate":2}],5:[function(require,module,exports){
function select(element) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
        element.focus();

        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        var isReadOnly = element.hasAttribute('readonly');

        if (!isReadOnly) {
            element.setAttribute('readonly', '');
        }

        element.select();
        element.setSelectionRange(0, element.value.length);

        if (!isReadOnly) {
            element.removeAttribute('readonly');
        }

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

module.exports = select;

},{}],6:[function(require,module,exports){
function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback;
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;

},{}],7:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'select'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('select'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.select);
        global.clipboardAction = mod.exports;
    }
})(this, function (module, _select) {
    'use strict';

    var _select2 = _interopRequireDefault(_select);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var ClipboardAction = function () {
        /**
         * @param {Object} options
         */
        function ClipboardAction(options) {
            _classCallCheck(this, ClipboardAction);

            this.resolveOptions(options);
            this.initSelection();
        }

        /**
         * Defines base properties passed from constructor.
         * @param {Object} options
         */


        _createClass(ClipboardAction, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = options.action;
                this.container = options.container;
                this.emitter = options.emitter;
                this.target = options.target;
                this.text = options.text;
                this.trigger = options.trigger;

                this.selectedText = '';
            }
        }, {
            key: 'initSelection',
            value: function initSelection() {
                if (this.text) {
                    this.selectFake();
                } else if (this.target) {
                    this.selectTarget();
                }
            }
        }, {
            key: 'selectFake',
            value: function selectFake() {
                var _this = this;

                var isRTL = document.documentElement.getAttribute('dir') == 'rtl';

                this.removeFake();

                this.fakeHandlerCallback = function () {
                    return _this.removeFake();
                };
                this.fakeHandler = this.container.addEventListener('click', this.fakeHandlerCallback) || true;

                this.fakeElem = document.createElement('textarea');
                // Prevent zooming on iOS
                this.fakeElem.style.fontSize = '12pt';
                // Reset box model
                this.fakeElem.style.border = '0';
                this.fakeElem.style.padding = '0';
                this.fakeElem.style.margin = '0';
                // Move element out of screen horizontally
                this.fakeElem.style.position = 'absolute';
                this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
                // Move element to the same position vertically
                var yPosition = window.pageYOffset || document.documentElement.scrollTop;
                this.fakeElem.style.top = yPosition + 'px';

                this.fakeElem.setAttribute('readonly', '');
                this.fakeElem.value = this.text;

                this.container.appendChild(this.fakeElem);

                this.selectedText = (0, _select2.default)(this.fakeElem);
                this.copyText();
            }
        }, {
            key: 'removeFake',
            value: function removeFake() {
                if (this.fakeHandler) {
                    this.container.removeEventListener('click', this.fakeHandlerCallback);
                    this.fakeHandler = null;
                    this.fakeHandlerCallback = null;
                }

                if (this.fakeElem) {
                    this.container.removeChild(this.fakeElem);
                    this.fakeElem = null;
                }
            }
        }, {
            key: 'selectTarget',
            value: function selectTarget() {
                this.selectedText = (0, _select2.default)(this.target);
                this.copyText();
            }
        }, {
            key: 'copyText',
            value: function copyText() {
                var succeeded = void 0;

                try {
                    succeeded = document.execCommand(this.action);
                } catch (err) {
                    succeeded = false;
                }

                this.handleResult(succeeded);
            }
        }, {
            key: 'handleResult',
            value: function handleResult(succeeded) {
                this.emitter.emit(succeeded ? 'success' : 'error', {
                    action: this.action,
                    text: this.selectedText,
                    trigger: this.trigger,
                    clearSelection: this.clearSelection.bind(this)
                });
            }
        }, {
            key: 'clearSelection',
            value: function clearSelection() {
                if (this.trigger) {
                    this.trigger.focus();
                }

                window.getSelection().removeAllRanges();
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.removeFake();
            }
        }, {
            key: 'action',
            set: function set() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';

                this._action = action;

                if (this._action !== 'copy' && this._action !== 'cut') {
                    throw new Error('Invalid "action" value, use either "copy" or "cut"');
                }
            },
            get: function get() {
                return this._action;
            }
        }, {
            key: 'target',
            set: function set(target) {
                if (target !== undefined) {
                    if (target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target.nodeType === 1) {
                        if (this.action === 'copy' && target.hasAttribute('disabled')) {
                            throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                        }

                        if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
                            throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                        }

                        this._target = target;
                    } else {
                        throw new Error('Invalid "target" value, use a valid Element');
                    }
                }
            },
            get: function get() {
                return this._target;
            }
        }]);

        return ClipboardAction;
    }();

    module.exports = ClipboardAction;
});

},{"select":5}],8:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './clipboard-action', 'tiny-emitter', 'good-listener'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./clipboard-action'), require('tiny-emitter'), require('good-listener'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.clipboardAction, global.tinyEmitter, global.goodListener);
        global.clipboard = mod.exports;
    }
})(this, function (module, _clipboardAction, _tinyEmitter, _goodListener) {
    'use strict';

    var _clipboardAction2 = _interopRequireDefault(_clipboardAction);

    var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

    var _goodListener2 = _interopRequireDefault(_goodListener);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var Clipboard = function (_Emitter) {
        _inherits(Clipboard, _Emitter);

        /**
         * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
         * @param {Object} options
         */
        function Clipboard(trigger, options) {
            _classCallCheck(this, Clipboard);

            var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this));

            _this.resolveOptions(options);
            _this.listenClick(trigger);
            return _this;
        }

        /**
         * Defines if attributes would be resolved using internal setter functions
         * or custom functions that were passed in the constructor.
         * @param {Object} options
         */


        _createClass(Clipboard, [{
            key: 'resolveOptions',
            value: function resolveOptions() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
                this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
                this.text = typeof options.text === 'function' ? options.text : this.defaultText;
                this.container = _typeof(options.container) === 'object' ? options.container : document.body;
            }
        }, {
            key: 'listenClick',
            value: function listenClick(trigger) {
                var _this2 = this;

                this.listener = (0, _goodListener2.default)(trigger, 'click', function (e) {
                    return _this2.onClick(e);
                });
            }
        }, {
            key: 'onClick',
            value: function onClick(e) {
                var trigger = e.delegateTarget || e.currentTarget;

                if (this.clipboardAction) {
                    this.clipboardAction = null;
                }

                this.clipboardAction = new _clipboardAction2.default({
                    action: this.action(trigger),
                    target: this.target(trigger),
                    text: this.text(trigger),
                    container: this.container,
                    trigger: trigger,
                    emitter: this
                });
            }
        }, {
            key: 'defaultAction',
            value: function defaultAction(trigger) {
                return getAttributeValue('action', trigger);
            }
        }, {
            key: 'defaultTarget',
            value: function defaultTarget(trigger) {
                var selector = getAttributeValue('target', trigger);

                if (selector) {
                    return document.querySelector(selector);
                }
            }
        }, {
            key: 'defaultText',
            value: function defaultText(trigger) {
                return getAttributeValue('text', trigger);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.listener.destroy();

                if (this.clipboardAction) {
                    this.clipboardAction.destroy();
                    this.clipboardAction = null;
                }
            }
        }], [{
            key: 'isSupported',
            value: function isSupported() {
                var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['copy', 'cut'];

                var actions = typeof action === 'string' ? [action] : action;
                var support = !!document.queryCommandSupported;

                actions.forEach(function (action) {
                    support = support && !!document.queryCommandSupported(action);
                });

                return support;
            }
        }]);

        return Clipboard;
    }(_tinyEmitter2.default);

    /**
     * Helper function to retrieve attribute value.
     * @param {String} suffix
     * @param {Element} element
     */
    function getAttributeValue(suffix, element) {
        var attribute = 'data-clipboard-' + suffix;

        if (!element.hasAttribute(attribute)) {
            return;
        }

        return element.getAttribute(attribute);
    }

    module.exports = Clipboard;
});

},{"./clipboard-action":7,"good-listener":4,"tiny-emitter":6}]},{},[8])(8)
});
(function ($) {

	$('.sui-code-snippet:not(.sui-no-copy)').each(function (i) {
		var id = 'sui-code-snippet-' + i,
			button = '<button class="sui-button" data-clipboard-target="#' + id + '">Copy</button>';

		$(this).wrap('<div class="sui-code-snippet-wrapper"></div>');
		$(this).attr('id', id).after(button);
	});

	new Clipboard('[data-clipboard-target]');

}(jQuery));

(function ($) {
	// Enable strict mode.
	'use strict';

	// Define global SUI object if it doesn't exist.
	if ('object' !== typeof window.SUI) {
		window.SUI = {};
	}
	SUI.link_dropdown = function(){

		function close_all_dropdowns($except)
		{
			var $dropdowns = $('.sui-dropdown');
			if($except) {
				$dropdowns = $dropdowns.not($except);
			}
			$dropdowns.removeClass('open');
		}

		$('body').click(function (e) {
			var $this = $(e.target),
				$el = $this.closest('.sui-dropdown');

			if ($el.length == 0) {
				close_all_dropdowns();
			}
			else if ($this.is('a')) {
				e.preventDefault();
				close_all_dropdowns($el);

				$el.toggleClass('open');
			}
		});
	};
	SUI.link_dropdown();
}($));

(function ($) {
	var version = 'sui-2-0-0-alpha-1';
	
	// Enable strict mode.
	'use strict';

	// Define global SUI object if it doesn't exist.
	if ('object' !== typeof window.SUI) {
		window.SUI = {};
	}


	// Add event handlers to show overlay dialogs.
	$("." + version).on("click", "a[rel=dialog]", showDialog);
	function showDialog(ev) {
		var el = $(this);
		var args = {};

		if (el.data("width")) { args.width = el.data("width"); }
		if (el.data("height")) { args.height = el.data("height"); }
		if (el.data("class")) { args.class = el.data("class"); }
		if (el.data("title")) { args.title = el.data("title"); }

		if (el.is("dialog")) {
			SUI.showOverlay("#" + el.attr("id"), args);
		} else if (el.attr("href")) {
			SUI.showOverlay(el.attr("href"), args);
		}
		return false;
	}
	/**
	 * Display a modal overlay on the screen.
	 * Only one overlay can be displayed at once.
	 *
	 * The dialog source must be (or contain) an <dialog> element.
	 * Only the <dialog> element is parsed and displayed in the overlay.
	 *
	 * @since  4.0.0
	 * @param  dialogSource Either CSS class/ID, URL or HTML string.
	 *         - ID must start with a hash '#'.
	 *         - Class must start with a dot '.'.
	 *         - URL contains '://' (absolute URL).
	 *         - URL starts with slash '/' (relative URL).
	 *         - Everything else is considered HTML string.
	 * @param  args Optional arguments, like callbacks (array)
	 *         @var callback  onShow
	 *         @var int       width (only for iframes)
	 *         @var int       height (only for iframes)
	 *         @var string    class
	 *         @var string    title
	 */
	SUI.showOverlay = function(dialogSource, args) {
		var retry = false;

		if ('object' !== typeof args) { args = {}; }
		args.onShow = args.onShow || false;

		// 1.) fetch the dialog code from the appropriate source.
		if ('#' === dialogSource[0] || '.' === dialogSource[0]) {
			/*
             * Type 1: CSS selector
             * The page contains a <dialog> element that is instantly displayed.
             */
			var dialog = $('dialog' + dialogSource);
			showTheDialog(dialog);
		} else if (-1 !== dialogSource.indexOf('://') || '/' === dialogSource[0]) {
			var type;
			if ('/' === dialogSource[0]) { type = 'ajax'; }
			else if (0 === dialogSource.indexOf(SUI.data.site_url)) { type = 'ajax'; }
			else { type = 'iframe'; }

			if ('ajax' === type) {
				/*
                 * Type 2a: AJAX handler
                 * The URL is relative or starts with the WordPress site_url. The
                 * URL is called as ajax handler. Result can be either HTML code or
                 * a JSON object with attributes `obj.success` and `obj.data.html`
                 * In either case, the returned HTML needs to contain a <dialog> tag
                 */
				$.get(
					dialogSource,
					'',
					function(resp) {
						var el;
						if ('{' === resp[0]) { resp = $.parseJSON(resp); }
						if ('object' === typeof resp) {
							if (resp && resp.success && resp.data.html) {
								el = $(resp.data.html);
							}
						} else {
							el = $(resp);
						}

						if (!el || !el.length) { return; }
						if (el.is('dialog')) { showTheDialog(el); }
						else { showTheDialog(el.find('dialog')); }
					}
				);
			} else if ('iframe' === type) {
				/*
                 * Type 2b: iframe container
                 * An external URL is loaded inside an iframe which is displayed
                 * inside the dialog. The external URL may return any content.
                 */
				var iframe = $('<div><iframe class="fullsize"></iframe></div>');
				iframe.find('iframe').attr('src', dialogSource);
				if (args.width) { iframe.find('iframe').attr('width', args.width); }
				if (args.height) { iframe.find('iframe').attr('height', args.height); }
				showTheDialog(iframe);
			}
		} else {
			/*
             * Type 3: Plain HTML code
             * The dialog source is plain HTML code that is parsed and displayed;
             * the code needs to contain an <dialog> element.
             */
			var el = $(dialogSource);
			if (el.is('dialog')) { showTheDialog(el); }
			else { showTheDialog(el.find('dialog')); }
		}

		// 2.) Render the dialog.
		function showTheDialog(dialog) {
			if ( ! dialog.length ) { return; }
			if ( ! SUI.prepareOverlay() ) {
				if ( ! retry ) {
					retry = true;
					SUI.closeOverlay();
					window.setTimeout(function() { showTheDialog(dialog); }, 610);
				}
				return;
			}

			if (! args.title) {
				args.title = dialog.attr('title');
			}
			if (args.class) {
				dialog.addClass(args.class);
			}

			SUI.overlay.box_title.find('h3').html(args.title);
			SUI.overlay.box_content.html(dialog.html());

			SUI.overlay.wrapper.addClass(dialog.attr('class'));
			if (dialog.hasClass('sui-no-close')) {
				SUI.overlay.wrapper.addClass('sui-no-close');
				SUI.overlay.close.remove();
			} else {

				SUI.overlay.container.on('click', function (e) {
					if ( ! $(e.target).closest('.sui-modal-box').length) {
						SUI.closeOverlay();
					}
				});
			}
			if (dialog.find('.sui-title-action').length) {
				SUI.overlay.box_content.find('.sui-title-action').appendTo(SUI.overlay.box_title);
			}

			SUI.overlay.box_content.on('click', '.sui-modal-close', SUI.closeOverlay);

			SUI.overlay.container.addClass('has-sui-overlay');
			SUI.overlay.wrapper.show();
			SUI.overlay.box.addClass('sui-bounce-in');
			SUI.overlay.scroll.addClass('sui-fade-in');
			SUI.overlay.visible = true;


			window.setTimeout(function(){
				SUI.overlay.box.removeClass('sui-bounce-in');
				SUI.overlay.scroll.removeClass('sui-fade-in');
			}, 1000);

			if ('function' === typeof args.onShow) { args.onShow(); }
		}

		return SUI;
	};

	/**
	 * Closes the current modal overlay again.
	 *
	 * @since  4.0.0
	 */
	SUI.closeOverlay = function() {
		if ( SUI.prepareOverlay() ) { return SUI; }

		SUI.overlay.container.removeClass('has-sui-overlay');
		SUI.overlay.box.addClass('sui-bounce-out');
		SUI.overlay.scroll.addClass('sui-fade-out');

		window.setTimeout(function() {
			if (null !== SUI.overlay.wrapper) {
				SUI.overlay.wrapper.hide()
			}
		}, 550);
		window.setTimeout(function() {
			if (null !== SUI.overlay.wrapper) {
				SUI.overlay.wrapper.remove();
				SUI.overlay.wrapper = null;
				SUI.overlay.visible = false;
			}
		}, 600);

		return SUI;
	};

	/**
	 * Creates all the DOM elements needed to display the overlay element.
	 *
	 * @since  4.0.0
	 * @return bool True if the modal is ready to be displayed.
	 */
	SUI.prepareOverlay = function() {

		SUI.overlay = SUI.overlay || {};

		if ( SUI.overlay.visible ) { return false; }

		if ( ! SUI.overlay.wrapper ) {
			SUI.overlay.container = $('html');
			SUI.overlay.wrapper = $('<div class="sui-overlay"></div>');
			SUI.overlay.scroll = $('<div class="sui-modal-box-scroll"></div>');
			SUI.overlay.parent_wrap = $('<div class="sui-wrap"></div>');
			SUI.overlay.box_wrap = $('<div class="sui-modal-box-wrap"></div>');
			SUI.overlay.back = $('<div class="sui-modal-back"></div>');
			SUI.overlay.box = $('<div class="sui-modal-box"></div>');
			SUI.overlay.box_title = $('<div class="sui-modal-title"><h3></h3></div>');
			SUI.overlay.box_content = $('<div class="sui-modal-content"></div>');
			SUI.overlay.close = $('<a aria-hidden="true" class="sui-modal-close">&times;</a><button class="sui-screen-reader-text"><span class="sui-screen-reader-text">Close</span></button>');

			SUI.overlay.back.appendTo(SUI.overlay.box_wrap);
			SUI.overlay.scroll.appendTo(SUI.overlay.wrapper);
			SUI.overlay.parent_wrap.appendTo(SUI.overlay.scroll);
			SUI.overlay.box_wrap.appendTo(SUI.overlay.parent_wrap);
			SUI.overlay.box.appendTo(SUI.overlay.box_wrap);
			SUI.overlay.box_title.appendTo(SUI.overlay.box);
			SUI.overlay.box_content.appendTo(SUI.overlay.box);
			SUI.overlay.close.appendTo(SUI.overlay.box_title);
			SUI.overlay.wrapper.appendTo('body');

			SUI.overlay.close.click(SUI.closeOverlay);
		}

		return true;
	};
}($));

(function ($) {

	$('.sui-notice-top:not(.sui-cant-dismiss)').delay(3000).slideUp('slow');
	$( '.sui-notice-dismiss' ).click( function( e ) {
		e.preventDefault();
		$(this).parent( '.sui-notice' ).stop().slideUp('slow');
		return false;
	});




}(jQuery));

(function ($) {

	// Enable strict mode.
	'use strict';

	// Define global SUI object if it doesn't exist.
	if ('object' !== typeof window.SUI) {
		window.SUI = {};
	}

	SUI.showHidePassword = function() {

		$(".sui-password-group").each(function () {
			var $this = $(this),
				$input = $this.find('input[type="password"]'),
				$button = $this.find('.sui-password-toggle');

			$button.on('click', function () {
				var $inputType = '';
				$(this).toggleClass('is-visible');

				if ($input.hasClass('is-visible')) {
					$input.removeClass('is-visible').addClass('is-hidden');
					$inputType = 'password';
					$button.find('> .sui-screen-reader-text').text('Show Password');
					$button.attr('data-tooltip', 'View Password');
					$button.find('> i').removeClass('sui-ico-eye-hide').addClass('sui-ico-eye');
				} else {
					$input.removeClass('is-hidden').addClass('is-visible');
					$inputType = 'text';
					$button.find('> .sui-screen-reader-text').text('Hide Password');
					$button.attr('data-tooltip', 'Hide Password');
					$button.find('> i').removeClass('sui-ico-eye').addClass('sui-ico-eye-hide');
				}
				var $repInput = $('<input type=' + $inputType + ' />')
					.attr('id', $input.attr('id'))
					.attr('name', $input.attr('name'))
					.attr('class', $input.attr('class'))
					.val($input.val())
					.insertBefore($input);
				$input.remove();
				$input = $repInput;
				$input.focus();
			});

		});

	}

	SUI.showHidePassword();

}(jQuery));

(function ($) {

	loadCircleScore = function(el) {
		var dial          = $(el).find('svg circle:last-child'),
			score         = $(el).data('score'),
			radius        = 42,
			circumference = 2 * Math.PI * radius,
			dashLength    = (circumference / 100) * score,
			gapLength     = dashLength * 100 - score,
			svg           = '\
				<svg viewbox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\
					<circle stroke-width="16" cx="50" cy="50" r="42" />\
					<circle stroke-width="16" cx="50" cy="50" r="42" stroke-dasharray="0,'+gapLength+'" />\
				</svg>\
				<span class="sui-circle-score-label">'+score+'</span>\
			';

		// Add svg to score element, add loaded class, & change stroke-dasharray to represent target score/percentage.
		$(el).prepend(svg).addClass('loaded').find('circle:last-child').css('animation','sui'+score+' 3s forwards');
	}

	$('.sui-circle-score').each(function () {
		loadCircleScore(this);
	});

}(jQuery));

(function ($) {
	suiSelect = function(el) {
		var jq = $(el),
			wrap, handle, list, value, items;

		if (! jq.is("select")) { return; }
		if (jq.closest(".select-container").length || jq.data("select2") || jq.is(".none-sui") ) { return; }

		// Add the DOM elements to style the select list.
		function setupElement() {
			jq.wrap("<div class='select-container'>");
			jq.hide();

			wrap = jq.parent();
			handle = $("<span class='dropdown-handle'><i class='sui-ico-arrow-down-carats'></i></span>").prependTo(wrap);
			list = $("<div class='select-list-container'></div>").appendTo(wrap);
			value = $("<div class='list-value'>&nbsp;</div>").appendTo(list);
			items = $("<ul class='list-results'></ul>").appendTo(list);

			wrap.addClass(jq.attr("class"));
		}

		// When changing selection using JS, you need to trigger a 'sui:change' event
		// eg: $('select').val('4').trigger('sui:change')
		function handleSelectionChange() {
			jq.on('sui:change',function(){
				//We need to re-populateList to handle dynamic select options added via JS/ajax
				populateList();
				items.find("li").not('.optgroup-label').on("click", function onItemClick(ev) {
					var opt = $(ev.target);
					selectItem(opt, false);
				});
			});
		}

		// Add all the options to the new DOM elements.
		function populateList() {
			items.empty();
			if( jq.find("optgroup").length ){
				jq.find("optgroup").each(function(){
					var optgroup = $(this),
						optgroup_item;
					optgroup_item = $("<ul></ul>").appendTo(items);
					$label = $('<li class="optgroup-label"></li>').text( optgroup.prop('label') );

					optgroup_item.html( $label );
					optgroup_item.addClass('optgroup');

					optgroup.find('option').each(function onPopulateLoop() {
						var opt = $(this),
							item;
						item = $("<li></li>").appendTo(optgroup_item);
						item.text(opt.text());
						item.data("value", opt.val());

						if (opt.val() == jq.val()) {
							selectItem(item);
						}
					});
				});
			}else{
				jq.find("option").each(function onPopulateLoop() {
					var opt = $(this),
						item;
					item = $("<li></li>").appendTo(items);
					item.text(opt.text());
					item.data("value", opt.val());

					if (opt.val() == jq.val()) {
						selectItem(item, true);
					}
				});
			}

		}

		// Toggle the dropdown state between open/closed.
		function stateToggle() {
			if( wrap.find("select").is(":disabled") ) return;

			if (! wrap.hasClass("active")) {
				stateOpen();
			} else {
				stateClose();
			}
		}

		// Close the dropdown list.
		function stateClose(item) {
			if (!item) { item = wrap; }
			item.removeClass("active");
			item.closest("tr").removeClass("select-open");
		}

		// Open the dropdown list.
		function stateOpen() {
			$(".select-container.active").each(function() {
				stateClose($(this));
			});
			wrap.addClass("active");
			wrap.closest("tr").addClass("select-open");
		}

		// Visually mark the specified option as "selected".
		function selectItem(opt, is_init) {
			is_init = typeof is_init === "undefined" ? false : is_init;
			value.text(opt.text());
			$(".current", items).removeClass("current");
			opt.addClass("current");
			stateClose();

			// Also update the select list value.
			jq.val(opt.data("value"));

			if( !is_init )
				jq.trigger("change");
		}

		// Element constructor.
		function init() {
			var sel_id;

			setupElement();
			populateList();
			handleSelectionChange();
			items.find("li").not('.optgroup-label').on("click", function onItemClick(ev) {
				var opt = $(ev.target);
				selectItem(opt, false);
			});

			handle.on("click", stateToggle);
			value.on("click", stateToggle);
			jq.on("focus", stateOpen);

			$(document).click(function onOutsideClick(ev) {
				var jq = $(ev.target),
					sel_id;

				if (jq.closest(".select-container").length) { return; }
				if (jq.is("label") && jq.attr("for")) {
					sel_id = jq.attr("for");
					if ($("select#" + sel_id).length) { return; }
				}

				stateClose();
			});

			sel_id = jq.attr("id");
			if (sel_id) {
				$("label[for=" + sel_id + "]").on("click", stateOpen);
			}
			jq.addClass("sui-styled");
		}

		init();

		return this;
	};
	// Convert all select lists to fancy sui Select lists.
	$("select").each(function(){
		suiSelect(this);
	});


}($));

(function ($) {
	suiTabs = function(el) {
		var jq = $(el).closest('.sui-tabs');

		if (!jq.length) {
			return;
		}

		// Resize the tab-area after short delay.
		function resizeArea() {
			window.setTimeout(resizeAreaHandler, 20);
		}

		// Resize the tab area to match the current tab.
		function resizeAreaHandler() {
			var current = jq.find('.sui-tab > input:checked').parent(),
				content = current.find('.sui-tab-content');

			jq.height(content.outerHeight() + current.outerHeight() - 6);
		}

		// Updates the URL hash to keep tab open during page refresh
		function updateHash() {
			var current = jq.find('.sui-tab > input:checked');

			current.parent().find('label').addClass( 'active' );

			if (current.attr('id').length) {
				self.updateHash(current.attr('id'));
			}
			resizeArea();
		}

		// Open the tab that is specified in window URL hash
		function switchTab() {
			var curTab,
				route = window.location.hash.replace(/[^\w-_]/g, '');

			if (route) {
				curTab = jq.find('input#' + route);
				if (curTab.parent().find('label').length) {
					jq.find('.sui-tab label.active').removeClass('active');
					curTab.parent().find('label').addClass('active');
					if (curTab.length && !curTab.prop('checked')) {
						curTab.prop('checked', true);
						scrollWindow();
					}
				}
			}
		}

		// Scroll the window to top of the tab list.
		function scrollWindow() {
			resizeArea();
			$('html, body').scrollTop(
				jq.offset().top
				- parseInt($('html').css('paddingTop'))
				- 20
			);
		}

		// Constructor.
		function init() {
			jq.on('click', '.sui-tab > input[type=radio]', updateHash);
			$(window).on('hashchange', switchTab);
			var current = jq.find('.sui-tab > input:checked');
			current.parent().find('label').addClass( 'active' );

			resizeArea();
			switchTab();
		}

		init();
		$(window).resize(function () {
			resizeArea();
		});

		return this;
	};

	updateHash = function(newHash) {
		newHash = newHash.replace( /^#/, '' );

		var fx,
			node = $( '#' + newHash );

		if (node.length) {
			// Remove the ID value from the actual element.
			node.attr('id', '');

			// Create a dummy element at current position with the specific ID.
			fx = $('<div></div>')
				.css({
					position: 'absolute',
					visibility: 'hidden',
					top: $(document).scrollTop() + 'px'
				})
				.attr('id', newHash)
				.appendTo(document.body);
		}

		// Change hash value in the URL. Browser will scroll to _current position_.
		document.location.hash = newHash;

		// Undo the changes from first part.
		if (node.length) {
			fx.remove();
			node.attr('id', newHash);
		}
	};

	// Initialize all tab-areas.
	$(".sui-tabs").each(function(){
		suiTabs(this);
	});


}($));

(function ($) {

	// Enable strict mode.
	'use strict';

	// Define global SUI object if it doesn't exist.
	if ('object' !== typeof window.SUI) {
		window.SUI = {};
	}

	SUI.upload = function() {

		$('.sui-upload-group input[type="file"]').on('change', function (e) {
			var file = $(this)[0].files[0],
				message = $(this).find('~ .sui-upload-message');

			if (file) {
				message.text(file.name);
			}
		});
	}

	SUI.upload();

}(jQuery));
