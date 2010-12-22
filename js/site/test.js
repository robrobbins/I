// silly test things...

// creates a 'namespace'
I.provide('TEST');
// make jquery avail. true = use async tag
I.require('jquery', true, false);

TEST.deGreen = function() {
    $('#footer').find('li').removeClass('green');
};

I.amDefined('$', function(){
    $('#footer').find('li').addClass('green');
    $('#btnTest').click(function(){TEST.deGreen();});
});

