// silly test things...

// creates a 'namespace'
I.provide('TEST');
// make jquery avail. i.js will use the path that deps.js
// provided when it called I.addDependency()
I.require('jquery');

TEST.deGreen = function() {
    $('#footer').find('li').removeClass('green');
};

// should we worry about doc.ready?
$('#footer').find('li').addClass('green');
$('#btnTest').click(function(){TEST.deGreen();});
