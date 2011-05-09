// the AMD spec really has no room for this minus adding more
// args to define(...). leave it seperate for now.
__cache__(['tooltip','bgiframe','delegate','dimensions']);

define('TEST',['jQuery','RML','TEST.reallyAwesome'], 
	function($, RML, awesome) {
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
	
	TEST.show('jQuery and RML are loaded and parsed now');
		// the required ra.js script provided these
	TEST.show(awesome.hello());
	
	$('#btn_cached').click(function() {
		__parse__(['dimensions','delegate','bgiframe','tooltip'], function() {
			TEST.show('All four dependencies loaded and parsed');
			TEST.tooltips();
		});
	});
	
	// always return a value if you provide one via the first arg to define()
	return TEST;
	
});
