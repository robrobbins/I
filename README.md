#i.js
#### Javascript dependency manager with magical powers

##Not So Quick and Dirty Tour Pt1.

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

####The Anonymous define(...)
Your script doesn't have to provide a namespace, you could just list dependencies and 
provide a callback:

	define(['bar, baz'], function(bar, baz) {
		bar.doStuff(...);
		baz.doStuff(...);
	});
	
You can't require such a script anywhere else as it doesn't provide anything. Which
brings me to my next topic...

#####Currently Unsupported Use Of The Anonymous define(...)
The current AMD spec states that an anonymous define(),
one which doesn't provide a module 'id' as the first argument (like the one above),
should use the filename as the module id. While this is a straightforward task
for the depwriter to do, it is not so for the various client-side environments. 
I don't feel it is efficient to write quite a bit of extra code just so a developer
can skip explicitly identifying a module. Therefore examples such as this:

	define({
		foo: 'bar',
		baz: function(a) {
			//do stuff...
		}
	});
	
Are not supported and i.js will throw an error. This example _will_ work however:

	define('foo.bar', {
		baz: 'quux',
		spam: function(a) {
			//do stuff...
		}
	});
	
The difference is in the explicit statement of a module id as the first argument.
Also unsupported would be this:

	define(function() {});
	
However this:

	define('foo', function() {
		// do stuff...
	});
	
Will work just fine (useful for class constructors).

###require()
This method is used to load a provided dependency when a full define()
statement is not needed. A typical use-case is seen in the example site in
this repo where *require()* is used on the index.html page. 

	require('TEST')
	
the dependency *test.js* provides *TEST* and *depwriter.rb* would have mapped those
for you already.

####Caveat
Don't put *define(...)* statements on non _*.js_ files. I have explored this
quite a bit and decided that it is much more efficient to reserve them for 
actual modules (your site's javascript files). Allowing define statements on
_.html_ or other template pages would have added code to the callback listening
mechanism _i.js_ employs. The *require()* statement is much better suited for
this.

A common use case is having a single *require('FOO')* statement in which the
loaded 'foo.js' module is acting as a bootstrap, or main type of script.

###__cache__
One of a two methods that now are prefixed and suffixed with double underscores (a la' 
Python magic methods). These methods are globals that are not part of the AMD
spec but are important aspects of the i.js API.

__cache__ will fetch and store a script in the browser cache without injecting
a tag and parsing it. See [this](http://www.phpied.com/preload-cssjavascript-without-execution/)
for a little background on 'preloading'. This allows you to control your page
load times even more as you can cache scripts which _may_ be needed later, such as
those that are needed in response to a particular user action.

Also, __cache__ is particularly useful for jQuery plugins in an async environment
where you need to make sure jQuery itself is fully ready before injecting the 
plugin script tags

__cache__ expects a single argument, either a string or arrays of strings that
resolve to provided namespaces of other scripts. For example look at the test.js
file in this repo:

	__cache__(['tooltip','bgiframe','delegate','dimensions']);
	
###__parse__
The counterpart to __cache__, this method expects two args. The first, same as
cache is a string or array of strings that represent other dependencies. The 
second is a callback that will be executed once the cached dependencies have
been loaded. This is essentially the same as the *anonymous define* that gives
an array of dependencies and a callback. The advantage of using __parse__ is
that is explicitly states in code that you are injecting tags for scripts that
have been *preloaded* 

###config.yaml
All your configuration settings should go here now. Take a look at the source
file itself as it's commented fairly extensively. 

###Demaximizer
You can set the config file's *demaximize* boolean to true to tell i.js to
create a minified version of your files (excluding cdn and third-party files)
and reference those instead of the non-minified versions. By default the 'min_suffix' is
set to '.min' (also in the config.yaml) which will result in a file named
'foo.min.js' in the same directory as a file named 'foo.js'. The generated
script tags will then point to 'foo.min.js'.

Setting the 'demaximize' flag back to false will simply change the script tags
source attribute back to the non-minified file (make sure to run depwriter again).

As with the auto-generated *deps.js* file you don't have to worry about these,
*i.js* takes care of them for you. Just go about developing your site then set
the *demaximize* flag to true when you are ready to move to production.

###Don't Ask Me
Try the included test-page example for yourself.

##Not So Quick And Dirty Pt.2


