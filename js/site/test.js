// silly test things...

// creates a 'namespace'
I.provide('TEST');
// make jquery avail. true = use async tag
I.require('rml', false, true);
I.require('jquery', true);
I.cache('tooltip');
I.cache('bgiframe');
I.cache('delegate');
I.cache('dimensions');

// setup a method to call when tooltips are ready
TEST.tooltips = function() {
	$('#ta_output').val('So, mouse over the "What for thing..."');
	$("#hovered").tooltip({ 
        bodyHandler: function() { 
            return "ITS FOR A TOOLTIP!!!"; 
        }, 
        showURL: false 
    });
};

I.amDefined(['jquery','rml'], function() {
	$('#ta_output').val('jQuery and rml are loaded and parsed now');
	
	$('#btn_cached').click(function() {
		
		I.parse(['dimensions','delegate','bgiframe','tooltip'], function() {
			
			$('#ta_output').val('All four dependencies loaded and parsed');
			
			TEST.tooltips();
			
		});
	});
});
