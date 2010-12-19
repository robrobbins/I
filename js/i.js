/**
 * @fileOverview Dependency management with Steve Souder's Control.js
 * baked right in...Largely based on the code from Google's Closure
 * Library
 * @author <a href="www.github.com/robrobbins/I">Rob Robbins</a>
 * @version 0.0.1
 */

/**
 * @namespace Global container of the I code.  Checks to if I is
 * already defined in the current scope before assigning to prevent
 * overwrite.
 */
var I = I || {};
/**
 * Reference for the current context. Except of special cases it will be 'window'
 */
I.global = this;

/**
 * Path for included scripts
 * @type {string}
 */
I.basePath = '';

/**
 * A hook to override basePath
 * @type {string|undefined}
 */
I.global.BASE_PATH = 'js/';
/**
 * Reference for the current document.
 */
I.doc = document;
/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {Array} provides An array of strings with the names of the objects
 * this file provides.
 * @param {Array} requires An array of strings with the names of the objects
 * this file requires.
 */
I.addDependency = function(relPath, provides, requires) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
    var deps = this._dependencies;
    for (var i = 0; provide = provides[i]; i++) {
        deps.nameToPath[provide] = path;
        if (!(path in deps.pathToNames)) {
            deps.pathToNames[path] = {};
        }
        deps.pathToNames[path][provide] = true;
    }
    for (var j = 0; require = requires[j]; j++) {
        if (!(path in deps.requires)) {
            deps.requires[path] = {};
        }
        deps.requires[path][require] = true;
    }
};
/**
 * Builds an object structure for the provided namespace path,
 * ensuring that names that already exist are not overwritten. For
 * example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by I.provide
 * @param {string} name name of the object that this file defines.
 * @param {*=} obj the object to expose at the end of the path.
 * @param {Object=} scope The object to add the path to; default
 * is I.global.
 * @private
 */
I._exportPath = function(name, obj, scope) {
  var parts = name.split('.');
  var cur = scope || this.global;

  // fix for Internet Explorer's strange behavior
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }
  // TODO re-evaluate this (no comp step)
  // ...use a for-loop and reserve the init logic as below.
  // Parentheses added to eliminate strict JS warning in Firefox.
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && obj) {
      // last part and we have an object; use it
      cur[part] = obj;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};
/**
 * Returns an object based on its fully qualified external name.  If you are
 * @param {string} name The fully qualified name.
 * @param {Object=} scope The object within which to look. Default is I.global.
 * @return {Object} The object or, if not found, null.
 */
I.getObjectByName = function(name, scope) {
  var parts = name.split('.');
  var cur = scope || this.global;
  for (var part; part = parts.shift(); ) {
    if (cur[part]) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};
/**
 * Find the path to i.js
 * @private
 */
I._getPath = function() {
    if(this.global.BASE_PATH) {
        this.basePath =  this.global.BASE_PATH;   
        return;
    }
    var scripts = this.doc.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; --i) {
        var src = scripts[i].src;
        var l = src.length;
        if(src.substr(l - 7) === 'i.js') {
            I.basePath = src.substr(0, l - 7);
            return;
        }
    }
};
/**
 * Creates object stubs for a namespace. When present in a file, I.provide
 * also indicates that the file defines the indicated object.
 * @param {string} name name of the object that this file defines.
 */
I.provide = function(name) {
    // Ensure that the same namespace isn't provided twice.
    if(I.getObjectByName(name) && !I._ns[name]) {
        throw Error('Namespace "' + name + '" already declared.');
    }
    var namespace = name;
    while ((namespace = namespace.substring(0, 
        namespace.lastIndexOf('.')))) {
            this._ns[namespace] = true;
    }
    this._exportPath(name);
};
/**
 * Implements a system for the dynamic resolution of dependencies
 * @param {string} path module to include, should match a 'provide'
 * in deps.js
 * @param {Boolean} noExec Should cjsexec=false be set on this script 
 * tag when written
 */
I.require = function(path, noExec) {
    // if the object already exists we do not need do do anything
    if (I.getObjectByName(path)) {
        return;
    }
    var _path = this._getPathFromDeps(path);
    if (_path) {
        this._included[_path] = true;
        if(noExec) {
            this._noExec[_path] = 'cjsexec=false'; 
        }
        this._writeScripts();
    } else {
        var errorMessage = 'I.require could not find: ' + path;
        if (this.global.console) {
            this.global.console['error'](errorMessage);
        }
        throw Error(errorMessage); 
    }
};
/**
 * Object used to keep track of urls that have already been added. This
 * record allows the prevention of circular dependencies.
 * @type {Object}
 * @private
 */
I._included = {};
/**
 * Lookup for which tags should be written with the cjsexec=false attribute.
 * Note that if you require the same file multiple times with this pref set
 * differently only one will end up here.
 */
I._noExec = {};
/**
 * This object is used to keep track of dependencies and other data that is
 * used for loading scripts
 * @private
 * @type {Object}
 */
I._dependencies = {
pathToNames: {}, // 1 to many
nameToPath: {}, // 1 to 1
requires: {}, // 1 to many
// used when resolving dependencies to prevent us from
// visiting the file twice
visited: {},
written: {} // used to keep track of script files we have written
};
/**
 * Looks at the dependency paths and tries to determine the script file that
 * fulfills a particular path.
 * @param {string} path In the form I.namespace.Class or project.script.
 * @return {?string} Url corresponding to the path, or null.
 * @private
 */
I._getPathFromDeps = function(path) {
    if (path in this._dependencies.nameToPath) {
        return this._dependencies.nameToPath[path];
    } else {
        return null;
    }
};
/**
 * Namespaces implicitly defined by provide. For example,
 * provide('I.foo.bar') implicitly declares
 * that 'I' and 'I.foo' must be namespaces.
 * @type {Object}
 * @private
 */
I._ns = {};
/**
 * Resolves dependencies based on the dependencies added using addDependency
 * and calls _writeScriptTag in the correct order.
 * @private
 */
I._writeScripts = function() {
    // the scripts we need to write this time
    var scripts = [];
    var seenScript = {};
    var deps = this._dependencies;

    /** @private */ function visitNode(path) {
        if(path in deps.written) {
            return;
        }
        // we have already visited this one. We can get here if we have 
        // cyclic dependencies
        if(path in deps.visited) {
            if (!(path in seenScript)) {
                seenScript[path] = true;
                scripts.push(path);
            }
            return;
        }
        deps.visited[path] = true;
        if(path in deps.requires) {
            for (var requireName in deps.requires[path]) {
                if(requireName in deps.nameToPath) {
                    visitNode(deps.nameToPath[requireName]);
                } else if(!I.getObjectByName(requireName)) {
                    // If the required name is defined, we assume that this
                    // dependency was bootstapped by other means. Otherwise,
                    // throw an exception.
                    throw Error('Undefined nameToPath for ' + requireName);
                }
            }
        }
        if(!(path in seenScript)) {
            seenScript[path] = true;
            scripts.push(path);
        }
    } // end visitNode
    for(var path in this._included) {
        if(!deps.written[path]) {
            visitNode(path);
        }
    }
    for(var i = 0; i < scripts.length; i++) {
        if(scripts[i]) {
            this._writeScriptTag({
                src: this.basePath + scripts[i],
                exec: this._noExec[scripts[i]] || ''
            });
        } else {
            throw Error('Undefined script input');
        }
    }
};
/**
 * Writes a script tag with CJS attributes if 
 * that script hasn't already been added to the document.   
 * @param {string} src Script source.
 * @param {Object} config Hash of CJS attributes
 * @private
 */
I._writeScriptTag = function(config) {
    // doc.write is fine here as i.js isn't async loaded
    if(!this._dependencies.written[config.src]) {
        this._dependencies.written[config.src] = true;
        this.doc.write(this._tagString(config));
    }
};
/**
 * Assemble and return a string for .write based on the config object
 */
I._tagString = function(config) {
    var str = '<script type="text/cjs"cjssrc="${src}" ${exec}></script>';
    return str.replace(/\$\{(.+?)\}/g,
        function(match, key) {
            return config[key];
        }
    );
};
// set the base path...
I._getPath();
// async load Control.js
var cjsscript = I.doc.createElement('script');
cjsscript.src = I.basePath + "control.js";
var cjssib = document.getElementsByTagName('script')[0];
cjssib.parentNode.insertBefore(cjsscript, cjssib);
// call for deps
I._writeScriptTag({
    src: I.basePath + 'deps.js', 
    exec: ''
});
