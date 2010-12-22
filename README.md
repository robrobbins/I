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

###I.Require(module, async, defer)

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

    I.amDefined('$', function(){
        $('#footer').find('li').addClass('green');
        $('#btnTest').click(function(){TEST.deGreen();});
    });

The code using jquery will probably try to execute before the jquery
object itself is finished initializing. I.amDefined waits for the passed in token, 
'$' in this case, to be defined then executes the function.

#####Note

The next revision of i.js adds one, possibly two features to amDefined().

1. The first arg can be an array of tokens to solve the case of modules with
   multiple dependencies. (this is a definite yes)
2. A third arg may be added, 'doc_ready'. If true I will check for the existence of
   the passed in tokens AND if the DOM is ready. I am testing this, as I don't 
   want to actually add this code to i.js (I needs to be as small as possible), 
   just use whatever library the user is loading. Meaning there would be a way
   to tell i.js what 'DOM ready' to look for (jquery's 'isReady' and such). In
   use this isn't much of a problem as if you are deferring your scripts as you
   should the dom will be ready (async however may need this...)

###Deps.js

There is a forthcoming Node.js utility program which reads your source code
recursively, starting at a specified directory, 
looking for I.provide(...) and I.require(...) statements. It uses these to
calculate and print out a file named *deps.js*. This file contains multiple
calls to I.addDependency(...) which in turn tell I.require() where named
modules actually are in your project, and how to load them. 
Take the deps.js from this project:

    I.addDependency('vendor/jquery.js', ['jquery'], [], true);
    I.addDependency('site/test.js', ['TEST'], ['jquery'], false, true);

The first tells i.js that any 
    I.require('jquery', true);
Can be resolved by looking in *(base_path)/vendor/* for *jquery.js*. This is
what gets written to the *src* attribute of the tag. 

#####Note

The boolean values in the the deps.js file are there because of the boolean
values in your I.require() statements. The *depWriter* utility sees them and
writes them to deps.js accordingly. Don't remove them from your source files
however as later passes with *depWriter* would overwrite them.

####Also

You can require a file multiple times but the first seen definition is what
will be used by subsequent requires.


