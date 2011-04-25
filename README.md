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
Though completely backwards compatible (I think...) there are some API changes
which 'hide' the underlying 'I' object.

	1. The alredy mentioned global define(...) method
	2. The global require(...) method
	2. A global method __cache__
	3. A global method __parse__
	
More on these soon.
	
###Not Quite Ready Yet
...I have to write in support for the 'define()' method into depwriter so 
check back later this week for that. Until then you can hand-write the 
deps.js file (see the included example). Also a non-depwriter version (no depwriter, no deps.js) should be
done as well. This version simply calls I.addDependency from 'define()'

###The other branches
Don't forget the older branches for completed and working older versions...
