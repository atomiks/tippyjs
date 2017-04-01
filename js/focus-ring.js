/* https://github.com/WICG/focus-ring */
document.addEventListener('DOMContentLoaded', function() {
    var hadKeyboardEvent = false,
        keyboardModalityWhitelist = [ 'input:not([type])',
                                      'input[type=text]',
                                      'input[type=number]',
                                      'input[type=email]',
                                      'input[type=tel]',
                                      'input[type=date]',
                                      'input[type=time]',
                                      'input[type=datetime]',
                                      'textarea',
                                      '[role=textbox]' ].join(','),
        isHandlingKeyboardThrottle,
        matcher = (function () {
	    var el = document.body;
	    if (el.matchesSelector)
		return el.matchesSelector;
	    if (el.webkitMatchesSelector)
		return el.webkitMatchesSelector;
	    if (el.mozMatchesSelector)
		return el.mozMatchesSelector;
	    if (el.msMatchesSelector)
		return el.msMatchesSelector;
	    console.error('Couldn\'t find any matchesSelector method on document.body.');
	}()),
	focusTriggersKeyboardModality = function (el) {
	    var triggers = false;
	    if (matcher) {
		triggers = matcher.call(el, keyboardModalityWhitelist) && matcher.call(el, ':not([readonly]');
	    }
	    return triggers;
	},
        addFocusRingClass = function(el) {
            if (el.classList.contains('focus-ring'))
                return;
            el.classList.add('focus-ring');
            el.setAttribute('data-focus-ring-added', '');
        },
        removeFocusRingClass = function(el) {
            if (!el.hasAttribute('data-focus-ring-added'))
                return;
            el.classList.remove('focus-ring');
            el.removeAttribute('data-focus-ring-added')
        };

    document.body.addEventListener('keydown', function() {
        hadKeyboardEvent = true;
        if (document.activeElement.matches(':focus')) {
            addFocusRingClass(document.activeElement);
        }
        if (isHandlingKeyboardThrottle) {
            clearTimeout(isHandlingKeyboardThrottle);
        }
        isHandlingKeyboardThrottle = setTimeout(function() {
            hadKeyboardEvent = false;
        }, 100);
    }, true);

    document.body.addEventListener('focus', function(e) {
        if (!hadKeyboardEvent && !focusTriggersKeyboardModality(e.target))
            return;
        addFocusRingClass(e.target);
    }, true);

    document.body.addEventListener('blur', function(e) {
        removeFocusRingClass(e.target)
    }, true);
});
