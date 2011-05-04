#i.js
#### Javascript dependency manager with magical powers

##Quick and Dirty Tour Pt1.

###AMD
This branch contains the AMD compatible version of i.js. This means the
CommonJS 'define()' syntax can be used:

	define('FOO', ['FOO.bar, FOO.baz'], function(bar, baz) {
		
		// The top level FOO{} object now exists
		foo.isAwesome = true;
		
		// bar and baz have been passed in as args. They would have been
		// scripts that provide FOO.bar and FOO.baz. Notice how we have
		// shortened the names. This is possible because the args are just
		// references to the actual objects so call them whatever you want
		FOO.doStuff = function() {
			bar.something(...);
			baz.somethingElse(...);
		};
		
		// Scripts that provide a namespace should return a value that will
		// be passed to others that require it. Here we return the FOO{} object
		// that we declared
		
		return FOO;
	});
	
The first argument to the 'define' method is the namespace you are providing, 
the second is an Array (must be an Array) of one or more Strings that must be
the provided namespace of other scripts you are using as dependencies. The third
is a function which will be called once all listed dependencies have been loaded
(AND thier callbacks called).

####Anonymous Functions
Your script doesn't have to provide a namespace, you could just list dependencies and 
provide an anonymous callback:

	define(['bar, baz'], function(bar, baz) {
		bar.doStuff(...);
		baz.doStuff(...);
	});
	
You can't require such a script anywhere else as it doesn't provide anything but
you don't always need to.
	
###define(...)
stuff...
###__require__
stuff...
###__cache__
stuff
###__parse__
stuff
###config.yaml
All your configuration settings should go here...
###Demaximizer
You can set the config file's 'Demaximize' boolean to true to tell i.js to
create a minified version of your files (excluding cdn and third-party files)
and reference those instead of the non-minified versions. By default the 'min_suffix' is
set to '.min' (also in the config.yaml) which will result in a file named
'foo.min.js' in the same directory as a file named 'foo.js'. The generated
script tags will then point to 'foo.min.js'.

Setting the 'demaximize' flag back to false will simply change the script tags
source attribute back to the non-minified file (make sure to run depwriter again).

###Don't Ask Me
Try the included test-page example for yourself
