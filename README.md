#I.js
#### Javascript dependency manager with defer and async support 

Jsdoc located [here](http://idoc.robrobbins.info)

##Quick and Dirty Tour Pt1.

###I.Provide(name)

    I.provide('Foo.bar');

Creates this global level nested object:

    window.Foo {
        bar:{}    
    }

###I.Require(something, async, defer)

    I.require('jquery', true);

Will append a script tag to the DOM with the async attribute set:

    <script src='path-to-jquery' async></script>

You can also have the defer attribute set:

    I.require('Foo.bar', false, true);

Will append this tag:

    <script src='path-to-file-that-provides-Foo.bar' defer></script>

###I.amDefined(token, function)

If a script/module relies on the result of another you can place your code
inside of this method. Think of it as *document.ready* for dependencies. For
example, look at the test.js page in this project.

    I.amDefined('jQuery', function(){
        $('#footer').find('li').addClass('green');
        $('#btnTest').click(function(){TEST.deGreen();});
    });

The code using jquery will probably try to execute before the jquery
object itself is finished initializing. I.amDefined waits for the passed in token, 
'jQuery' in this case, to be defined then executes the function.

####Array of tokens

You can pass an array of namespaces as well:

    I.amDefined(['Foo', 'Bar'], function() {
        // yeah, foo and bar are loaded   
    });

Make sure to use the namespace that is actually provided in a call to
I.provide() or listed in the 'provides' array in the deps.js file

###Deps.js

This is a Ruby utility program which reads your source code
recursively, starting at your root directory (well, the directory you place it 
in which should be the root of your site), 
looking for I.provide(...) and I.require(...) statements. It uses these to
calculate and print out a file named *deps.js*. This file contains multiple
calls to I.addDependency(...) which in turn tell I.require() where named
modules actually are in your project, and how to load them. 
Take the deps.js from this project:

    I.addDependency('vendor/jquery.js', ['jquery'], [], true);
    I.addDependency('site/test.js', ['TEST'], ['jquery'], false, true);

The first tells i.js that any:

    I.require('jquery', true);

Can be resolved by looking in *(base_path)/vendor/* for *jquery.js*. This is
what gets written to the *src* attribute of the tag. The empty array indicates
that this module has no stated dependencies. The true tells I to append the 
async attribute to the script tag.

The second instructs I to, when encountering an:

    I.require('TEST', false, true);

To first load the dependency named 'jquery' (the 3rd arg is an array of dependencies), then loading
the module providing 'TEST' which is found at *base_path/site/test.js*. This
tag should have the *defer* attribute set

#####Note

The boolean values in the the deps.js file are there because of the boolean
values in your I.require() statements. The *depWriter* utility sees them and
writes them to deps.js accordingly. Don't remove them from your source files
(though you could once deps.js is written) however as later passes with *depWriter* 
would overwrite them.

####Also

You can require a file multiple times but the first seen definition is what
will be used by subsequent requires.

###Depwriter

A ruby utility program that scans your directories by filetypes (configurable, 
for example .js and .erb) searching for I.provide() and/or I.require() calls. The
presence of these statements signals to the Depwriter that they are dependencies 
and should be handled. If a file *provides* a namespace we call it a provider and 
note its path relative to *i.js*. In the case of a *require* we check that the 
*provider* is present and also if the *provider* should be loaded *async* or 
be *deferred*.

####Third Party Libraries
In the case of third-party libraries (jquery for example) that do not contain
I.provide() / I.require() statements I have included the ability to identify 
directories which hold scripts that you want added as dependencies regardless.
Any scripts found in those folders will be added as *providers*. You can then
require them by their script name minus the extension:

	I.require('jquery')
	
Note that we are not using the actual namespace provided by the file (that would 
have been 'jQuery' or '$') as we do with our own files.

####Jquery Plugin Caveat

You should wrap the anonymous function that jQuery plugins execute in like so:

	I.amDefined('jquery', function() {
		//plugin source here
	});

This way your jQuery plugins won't try to locate jQuery itself before it is done parsing. 
Considering the size difference of jQuery itself verses most plugins this is a very likely 
scenario.

The next version of i.js (ETA this weekend) adds prefetch/caching of scripts a la' 
Stoyan's [preload](http://www.phpied.com/preload-then-execute/). Which works well for
this and doesn't require wrapping the source code.

This is definitely the Alpha release of Depwriter as it is in a very raw state, but
you can use it now if you follow a couple of simple set-up steps (see the source).
    
1. Drop the 'depwriter.rb' file into the root of your site
2. Put the 'depruby' folder anywhere in your site, just set the path in 
depwriter accordingly (see the source)
3. Set the relative path to *i.js* from root (see source)
4. Set the *'ven_dirs'* instructing Depwriter to include third party 
libraries in those directories, even though they do not contain
*I.provide / I.require* statements

Once you've done that, cd into the root of your project and enter:
	
	ruby depwriter.rb
	
This will result in the *deps.js* file being written and placed into the 
directory where i.js is.

###Blog Posts / Screencasts coming

I'll do some this week.

###Forthcoming Changes

I'll probably move the 4 configuration steps into a .yaml file and load them from
there. 
	
	
