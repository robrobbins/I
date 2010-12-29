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

There is a forthcoming Node.js utility program which reads your source code
recursively, starting at a specified directory, 
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
(though you could once deps.js is written)however as later passes with *depWriter* 
would overwrite them.

####Also

You can require a file multiple times but the first seen definition is what
will be used by subsequent requires.

###NO depwriter.js yet

I am a few working days away from the *depWriter.js* Node utility being
finished so for now just append entries into the deps.js file by hand.
Remember, the args are:

    I.addDependency(path-to-file, what-it-provides, what-it-requires, async, defer);
