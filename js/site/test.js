// the AMD spec really has no room for this minus adding more
// args to define(...). leave it seperate for now.
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

define('TEST',['jQuery','RML','TEST.reallyawesome'], 
	function($, RML, ra_) {
	TEST.show('jQuery and RML are loaded and parsed now');
	
	// the required ra.js script provided these
	TEST.show(ra_.hello());
	// TEST.show(ara_.alsoreallyawesome.hello());
	
	$('#btn_cached').click(function() {
		I.parse(['dimensions','delegate','bgiframe','tooltip'], function() {
			TEST.show('All four dependencies loaded and parsed');
			TEST.tooltips();
		});
	});
});
