// 'I.Numerator' helper mixin, adapted from my own 'X' libraries
// written for a series of articles in JSMag. see github.com/robrobbins/X
define('__i__.numerable', {
	// For script engines that already support iterators.
	StopIteration: window['StopIteration'] || Error('StopIteration'),
	
	// Accept a single hash as an argument and return a N x 2
	// matrix which can be consumed by the Iterator class
	fromHash: function(obj) {
	    if(!Object.prototype.toString.call(obj) === '[object Object]') {
	        throw Error('Argument must be an Object');
	    }
	    var mx = [];
	    var index = 0;
	    for(var p in obj) {
	        if(obj.hasOwnProperty(p)) {
	            var a = [];
	            a[0] = p;
	            a[1] = obj[p];
	        }
	        mx[index] = a;
	        index++;
	    }
	    return mx;
	}
});
