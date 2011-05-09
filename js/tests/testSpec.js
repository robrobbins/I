define('testSpec', ['TEST'], function(test) {
	describe('Test spy', function () {
		
		// tests will have acces to passed in 'test' obj via closure
	  it('should get called', function () {
			spyOn(test, 'show');
			test.show('hello test');
			
			expect(test.show).toHaveBeenCalledWith('hello test');
		});
		
	});
	// returns are necessary if if you dont plan to use them as i.js keeps
	// track of dependency callbacks this way 
	return testSpec;
});