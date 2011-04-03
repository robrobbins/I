// silly test things...

// creates a 'namespace'
I.provide('TEST');

I.require('rml', false, true);
I.require('jquery', true);
I.require('TEST.reallyawesome', true);
// NOTE this is not actually necessary because you will get both
// because they are in the same file (ra.js). Explicitness however is
// preferred IMO
I.require('TEST.alsoreallyawesome', true);

I.cache('tooltip');
I.cache('bgiframe');
I.cache('delegate');
I.cache('dimensions');

// setup a method to call when tooltips are ready
TEST.tooltips = function() {
	this.show('So, mouse over the "What\'s this for? thing"');
	$("#hovered").tooltip({ 
        bodyHandler: function() { 
            return "ITS FOR A TOOLTIP!!!"; 
        }, 
        showURL: false 
    });
};

TEST.show = function(str) {
	// show stuff in the textarea
	var ta = $('#ta_output');
	curr_val = [ta.val()];
	curr_val.push(str);
	ta.val(curr_val.join('\n'));
};

I.amDefined(['jquery','rml','TEST.reallyawesome','TEST.alsoreallyawesome'], function() {
	TEST.show('jQuery and rml are loaded and parsed now');
	
	// the required ra.js script provided these
	TEST.show(TEST.reallyawesome.hello());
	TEST.show(TEST.alsoreallyawesome.hello());
	
	$('#btn_cached').click(function() {
		I.parse(['dimensions','delegate','bgiframe','tooltip'], function() {
			TEST.show('All four dependencies loaded and parsed');
			TEST.tooltips();
		});
	});
});
