/**
 * @fileOverview Dependency management with magical powers
 * Largely based on the code from Google's Closure Library
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
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {Array} provides An array of strings with the names of the objects
 * this file provides.
 * @param {Array} requires An array of strings with the names of the objects
 * this file requires.
 * @link I.require
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
 * Lookup for I.Cache method
 * @private
 */
I._amCached = {};
/**
 * If a specified namespace, including dependencies, is not defined yet this method
 * stores its callback to call when available
 * @param {String|Array} ns The provided namespace
 * @param {String|Array} dep one or more dependencies of the provided namespace,
 * a string or an array of strings
 * @param fn The function to call when dep(s) are defined
 */
I.amDefined = function(ns, dep, fn) {
	var deps, comp, undef=0, args = [], _deps = this._dependencies;
	// Normalize the inputs...
	// an anonymous callback
	if(!ns) {
		ns = this._anonPrefix + this._anonCounter;
		this._anonCounter++;
	}
	// could be a single dependency or a composite set
	if(typeof dep === 'string') {
		deps = dep.split('&');
	} else {
		deps = dep;
	}
	if(typeof fn !== 'function') {
		throw Error('Missing or incorrect type of callback parameter');
	}
	// checking for defined tokens
	for(var n=0, len=deps.length; n < len; n++) {
		var curr = deps[n];
		if(curr in this._amLoaded) {
			// the dep is loaded, see if its deps are loaded
			var dds = _deps.requires[_deps.nameToPath[curr]];
			// may have no dependencies of its own
			if(dds) {
				for(var dd in dds) {
					if(!(dd in this._amLoaded)) {
						undef++;
						break;
					}
					// we need to wait for any dep's callbacks which haven't
					// been called yet
					if(!(dd in this.amVendor)) {
						if(!this._returnForName[dd]) {
								undef++;
								break;
						}
					}
				}	
			}
			// pass the return value of the namespace's callback or a global ref
			// to a dep with no callback
			args.push(this._returnForName[curr] || this.getNamespace(curr));
		} else {
			undef++;
		}
	}
	// all are defined, we're done here
	if(undef === 0) {
		// callbacks should return a val
		this._returnForName[ns] = fn.apply(this.global, args);
	} else {
		// multiple left, make a composite key and assign it to comp
		comp = deps.join('&');
		// ns = comp : fn
		if (!(ns in this._amWaiting)) {
			this._amWaiting[ns] = {};
			this._amWaiting[ns][comp] = fn;
		}
	}
};
/**
 * Quick IE check for I.cache
 */
I.amIE = navigator.appName.indexOf('Microsoft') === 0;
/**
 * A lookup for loaded scripts by their provided namespaces.
 * @private
 */
I._amLoaded = {};
// TODO create a setter for this hash
I.amVendor = {
	'jQuery': true
};
/**
 * The queue for waiting namespaces and their callbacks
 * @private
 */
I._amWaiting = {};
/**
 * Combined with anonPrefix we can keep internal identities for
 * anonymous modules
 * @private
 */
I._anonCounter = 0;
/**
 * Combined with anonCounter we can keep internal identities for
 * anonymous modules
 * @private
 */
I._anonPrefix = 'anon_';
/**
 * Fetch and store a script in the browser cache. See 
 * http://www.phpied.com/preload-cssjavascript-without-execution/.
 * @param {String|Array} ns. The namespace that is explicitly provided by the
 * dependency you want to cache
 */
I.cache = function(ns) {
	// allow for an array of strings
	if(typeof ns !== 'string') {
		//assume an array
		for(var n; n = ns.shift(); ) {
			this.cache(n);
		}
		return;
	}
	// already cached?
	if(ns in this._amCached) {return;}
	// depending on browser, preload the script as...
	if(this.amIE) {
		new Image().src = this._dependencies.nameToPath[ns];
	} else {
		var o = document.createElement('object');
		o.data = this._dependencies.nameToPath[ns];
		o.width = 0;
		o.height = 0;
		document.body.appendChild(o);
	}
	this._amCached[ns] = true;
};
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
 * Reference for the current document.
 */
I.doc = document;
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
I._exportNamespace = function(name, obj, scope) {
	// TODO Update to use '/' as delimiters as well
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
 * Get the namespace(s) provided by a file
 * @private
 */
I._getDepsFromPath = function(path) {
	if (path in this._dependencies.pathToNames) {
		return this._dependencies.pathToNames[path];
	} else {
		return null;
	}
};
/**
 * Returns an object based on its fully qualified external name.
 * @param {string} name The fully qualified name.
 * @param {Object=} scope The object within which to look. Default is I.global.
 * @return {Object} The object or, if not found, null.
 */
I.getNamespace = function(name, scope) {
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
 * Looks at the dependency paths and tries to determine the script file that
 * fulfills a particular path.
 * @param {string} path In the form I.namespace.Class or project.script
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
 * Reference for the current context. Except of special cases it will be 'window'
 */
I.global = this;
/**
 * Object used to keep track of urls that have already been added. This
 * record allows the prevention of circular dependencies.
 * @type {Object}
 * @private
 */
I._included = {};
/**
 * Namespaces implicitly defined by provide. For example,
 * provide('I.foo.bar') implicitly declares
 * that 'I' and 'I.foo' must be namespaces.
 * @type {Object}
 * @private
 */
I._ns = {};
/**
 * Normalize varying arguments. Call require() and amDefined() for
 * both the AMD define(...) and __parse__ methods
 */
I.parse = function(/* var_args */) {
	// normalize the inputs
	var fn, dep, ns;
	if(arguments.length === 3) {
		fn = arguments[2];
	}
	if(fn) {
		dep = arguments[1];
		ns = arguments[0];
	} else {
		fn = arguments[1];
		dep = arguments[0];
		ns = false;
	}
	if(typeof dep !== 'string') {
		// assume an array
		for(var i = 0; i < dep.length; i++) {
			this.require(dep[i]);
		}
	} else {
		this.require(dep);
	} 
	this.amDefined(ns, dep, fn);
};
/**
 * Creates object stubs for a namespace. When present in a file, I.provide
 * also indicates that the file defines the indicated object.
 * @param {string} name name of the object that this file defines.
 * @param {Object} obj An optional object to pass along to _exportNamespace
 */
I.provide = function(name, obj) {
	// Ensure that the same namespace isn't provided twice.
	if(I.getNamespace(name) && !I._ns[name]) {
		throw Error('Namespace "' + name + '" already declared.');
	}
	var namespace = name;
	while ((namespace = namespace.substring(0, 
		namespace.lastIndexOf('.')))) {
			this._ns[namespace] = true;
	}
	this._exportNamespace(name, obj);
};
/**
 * Implements a system for the dynamic resolution of dependencies
 * @param {string} ns Module to include, should match a 'provide'
 * in deps.js 
 */
I.require = function(ns) {
	// don't load more than once
	if(ns in this._amLoaded) return;
	var _path = this._getPathFromDeps(ns);
	if (_path) {
		this._included[_path] = true;
		this._writeScripts();
	} else {
		var errorMessage = 'I.require could not find: ' + ns;
		if (this.global.console) {
			this.global.console['error'](errorMessage);
		}
		throw Error(errorMessage); 
	}
};
/**
 * Named dependency objects with callbacks return a value
 * They are kept here so they can be passed to the callbacks
 * of others that require them
 * @ private
 */
I._returnForName = {};
/**
 * Ref the Objects toString method so we can do some type checking
 * @private
 */
I._toStr = Object.prototype.toString;
/**
 * Callback for when a script has been injected and parsed
 * @private
 */
I._waitListener = function() {
	// use the path to get an object
	var obj = I._getDepsFromPath(this.getAttribute('src'));
	// the obj has 'provide' tokens as keys
	for(var k in obj) {
		// done in-loop to handle multiple provides per file
		I._amLoaded[k] = true;
	}
	// push the wait list through amDefined
	var waiting = I._amWaiting;
	// inf loop === bad
	I._amWaiting = {};
	for(var ns in waiting) {
		if(waiting.hasOwnProperty(ns)) {
			for(var dep in waiting[ns]) {
				I.amDefined(ns, dep, waiting[ns][dep]);
			}
		}
	}
};
/**
 * Resolution based on the dependencies added using addDependency
 * and calls _writeScriptTag accordingly.
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
				} else if(!I.getNamespace(requireName)) {
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
			this._writeScriptTag(scripts[i]);
		} else {
			throw Error('Undefined dependency');
		}
	}
};
/**
 * Writes a script tag if 
 * that script hasn't already been added to the document.	
 * @param {Object} config Hash of attributes
 * @private
 */
I._writeScriptTag = function(src) {
	if(!this._dependencies.written[src]) {
		this._dependencies.written[src] = true;
		var script = this.doc.createElement('SCRIPT');
		script.setAttribute('src', src);
		if(I.amIE) {
			script.onreadystatechange = function() {
				if(script.readyState == 'loaded'|| script.readyState == 'complete') {
					I._waitListener.call(script);
				}
			};	
		} else {
			// call _waitListener when loaded
			script.onload = I._waitListener;
		}
		this.doc.getElementsByTagName('HEAD')[0].appendChild(script);
	}
};
/**
 * Global declaration and parsing for the commonJS 'define' function
 * see http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition
 * @param {String} id What the AMD proposal calls an 'id' is what i.js
 * sees as a declaration of a provided namespace
 * @param {String} namespace The provided namespace
 * @param {Array} dependencies
 * @param {Function} factory What i.js sees as amDefined()
 */
window.define = function(/* var_args */) {
	var args = Array.prototype.slice.call(arguments), ns;
	// optional 'id'. depwriter would have used this as a 'provide' alrerady
	if(I._toStr.call(args[0]) === '[object String]') {
		ns = args.shift();
	}
	// now the '2nd' arg
	switch(I._toStr.call(args[0])) {
	case '[object Array]':
		// if we have a namespace provide it
		if(ns) {
			//TODO replace '/' with '.'
			I.provide(ns);
		} else ns = false;
		// I.parse can handle the primary use case here
		if(args[1] && typeof args[1] === 'function') {
			I.parse(ns, args[0], args[1]);
		} else {
			throw Error('Unsupported use of dependencies');
		}
		break;
	case '[object Function]':
		throw Error('Function as first argument unsupported');
		break;
	case '[object Object]':
		// FIXME logic for getting filename clientside id not given
		if(!ns) {
			var scripts = document.getElementsByTagName('script');
			var lastScript = scripts[scripts.length-1];
			ns = lastScript.src;
		}
		// this will mixin the namespace to global and add the properties to it
		I.provide(ns, args[0]);
		break;
	default:
		throw Error('Unsupported argument type');
	}
};
window.define.amd = {};
/**
 * The AMD spec does not provide a 'preload' functionality. The 
 * global __cache__ function remedies this.
 * @param {String | Array} namespace(s) The provided name, or an array of them,
 * to cache
 * @link I.cache
 */
__cache__ = function() {I.cache.apply(I, arguments);};
/**
 * The counterpart of __cache__. The dependecies defined by the passed in
 * arguments will be injected.
 * @param {String | Array} namespace The provided name of a dependency to write
 * @link I.parse
 */
__parse__ = function() {I.parse.apply(I, arguments);};
/**
 * Alias for I.require
 * @param {String | Array} namespace A dependency to write
 * @link I.require
 */
window.require = function() {I.require.apply(I, arguments);};