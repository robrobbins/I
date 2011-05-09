define('reallyAwesomeSpec', ['TEST.reallyAwesome'], function(awesome) {
	describe('TEST.reallyAwesome', function () {
		// call the method on the passed in TEST.reallyAwesome object
	  var something = awesome.hello();

	  it('should say something', function () {
	    expect(something).toEqual(
				'Also, TEST.reallyawesome namespace exists and is ready for use.');
	  });
	
	});
	// returns are necessary if if you dont plan to use them as i.js keeps
	// track of dependencies callback this way 
	return reallyAwesomeSpec;	
});