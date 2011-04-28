#I.js
#### Javascript dependency manager with magical powers

Jsdoc located [here](http://idoc.robrobbins.info)

##Quick and Dirty Tour Pt1.

###AMD
This branch contains the AMD compatible version of i.js. This means the
CommonJS 'define()' syntax can be used:

	define('foo', ['bar, baz'], function(bar, baz) {
		bar.doStuff(...);
		baz.doStuff(...);
		
		return foo;
	});
	
The included sample page has an example using jQuery and some plugins.

###API Changes
The AMD branch of i.js is not meant to be backwards compatible with non-amd 
versions. It's define() or nothin'...Highlights would be:

	1. The alredy mentioned global define(...) method
	2. The global require(...) method
	2. A global method __cache__
	3. A global method __parse__
	
More on these soon.

