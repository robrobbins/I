/**
 * @fileOverview Dependency management with magical powers
 * @author <a href="www.github.com/robrobbins/I">Rob Robbins</a>
 * @version 0.0.1
 */

/**
 * @namespace Global container of the I code.  Checks to if I is
 * already defined in the current scope before assigning to prevent
 * overwrite.
 */
var __i__ = __i__ || {};
/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {Array} provides An array of strings with the names of the objects
 * this file provides.
 * @param {Array} requires An array of strings with the names of the objects
 * this file requires.
 * @link __i__.require
 */
__i__.addDependency = function(relPath, provides, requires) {
	var provide, require;
	var path = relPath.replace(/\\/g, '/');
	var deps = this.dependencies;
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
 * Lookup for __i__.Cache method
 * @private
 */
__i__.amCached = {};
/**
 * If a specified namespace, including dependencies, is not defined yet this method
 * stores its callback to call when available
 * @param {String|Array} ns The provided namespace
 * @param {String|Array} dep one or more dependencies of the provided namespace,
 * a string or an array of strings
 * @param fn The function to call when dep(s) are defined
 */
__i__.amDefined = function(ns, dep, fn) {
	var deps, comp, undef=0, args = [], _deps = this.dependencies;
	// Normalize the inputs...
	// an anonymous callback
	if(!ns) {
		ns = this.anonPrefix + this.anonCounter;
		this.anonCounter++;
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
		if(curr in this.amLoaded) {
			// the dep is loaded, see if its deps are loaded
			var dds = _deps.requires[_deps.nameToPath[curr]];
			// may have no dependencies of its own
			if(dds) {
				for(var dd in dds) {
					if(!(dd in this.amLoaded)) {
						undef++;
						break;
					}
					// we need to wait for any dep's callbacks which haven't
					// been called yet
					if(!(dd in this.amVendor)) {
						if(!this.returnForName[dd]) {
								undef++;
								break;
						}
					}
				}	
			}
			// pass the return value of the namespace's callback or a global ref
			// to a dep with no callback
			args.push(this.returnForName[curr] || this.getNamespace(curr));
		} else {
			undef++;
		}
	}
	// all are defined, we're done here
	if(undef === 0) {
		// callbacks should return a val
		this.returnForName[ns] = fn.apply(this.global, args);
	} else {
		// multiple left, make a composite key and assign it to comp
		comp = deps.join('&');
		// ns = comp : fn
		if (!(ns in this.amWaiting)) {
			this.amWaiting[ns] = {};
			this.amWaiting[ns][comp] = fn;
		}
	}
};
/**
 * Quick IE check for __i__.cache
 */
__i__.amIE = navigator.appName.indexOf('Microsoft') === 0;
/**
 * A lookup for loaded scripts by their provided namespaces.
 * @private
 */
__i__.amLoaded = {};
// TODO create a setter for this hash
__i__.amVendor = {
	'jQuery': true
};
/**
 * The queue for waiting namespaces and their callbacks
 * @private
 */
__i__.amWaiting = {};
/**
 * Combined with anonPrefix we can keep internal identities for
 * anonymous modules
 * @private
 */
__i__.anonCounter = 0;
/**
 * Combined with anonCounter we can keep internal identities for
 * anonymous modules
 * @private
 */
__i__.anonPrefix = 'anon_';
/**
 * Fetch and store a script in the browser cache. See 
 * http://www.phpied.com/preload-cssjavascript-without-execution/.
 * @param {String|Array} ns. The namespace that is explicitly provided by the
 * dependency you want to cache
 */
__i__.cache = function(ns) {
	// allow for an array of strings
	if(typeof ns !== 'string') {
		//assume an array
		for(var n; n = ns.shift(); ) {
			this.cache(n);
		}
		return;
	}
	// already cached?
	if(ns in this.amCached) {return;}
	// depending on browser, preload the script as...
	if(this.amIE) {
		new Image().src = this.dependencies.nameToPath[ns];
	} else {
		var o = document.createElement('object');
		o.data = this.dependencies.nameToPath[ns];
		o.width = 0;
		o.height = 0;
		document.body.appendChild(o);
	}
	this.amCached[ns] = true;
};
/**
 * This object is used to keep track of dependencies and other data that is
 * used for loading scripts
 * @private
 * @type {Object}
 */
__i__.dependencies = {
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
__i__.doc = document;
/**
 * Builds an object structure for the provided namespace path,
 * ensuring that names that already exist are not overwritten. For
 * example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by __i__.provide
 * @param {string} name name of the object that this file defines.
 * @param {*=} obj the object to expose at the end of the path.
 * @param {Object=} scope The object to add the path to; default
 * is __i__.global.
 * @private
 */
__i__.exportNamespace = function(name, obj, scope) {
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
__i__.getDepsFromPath = function(path) {
	if (path in this.dependencies.pathToNames) {
		return this.dependencies.pathToNames[path];
	} else {
		return null;
	}
};
/**
 * Returns an object based on its fully qualified external name.
 * @param {string} name The fully qualified name.
 * @param {Object=} scope The object within which to look. Default is __i__.global.
 * @return {Object} The object or, if not found, null.
 */
__i__.getNamespace = function(name, scope) {
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
 * @param {string} path In the form __i__.namespace.Class or project.script
 * @return {?string} Url corresponding to the path, or null.
 * @private
 */
__i__.getPathFromDeps = function(path) {
	if (path in this.dependencies.nameToPath) {
		return this.dependencies.nameToPath[path];
	} else {
		return null;
	}
};
/**
 * Reference for the current context. Except of special cases it will be 'window'
 */
__i__.global = this;
/**
 * Object used to keep track of urls that have already been added. This
 * record allows the prevention of circular dependencies.
 * @type {Object}
 * @private
 */
__i__.included = {};
/**
 * Namespaces implicitly defined by provide. For example,
 * provide('__i__.foo.bar') implicitly declares
 * that 'I' and '__i__.foo' must be namespaces.
 * @type {Object}
 * @private
 */
__i__.ns = {};
/**
 * Normalize varying arguments. Call require() and amDefined() for
 * both the AMD define(...) and __parse__ methods
 */
__i__.parse = function(/* var_args */) {
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
 * Creates object stubs for a namespace. When present in a file, __i__.provide
 * also indicates that the file defines the indicated object.
 * @param {string} name name of the object that this file defines.
 * @param {Object} obj An optional object to pass along to _exportNamespace
 */
__i__.provide = function(name, obj) {
	// Ensure that the same namespace isn't provided twice.
	if(this.getNamespace(name) && !this.ns[name]) {
		throw Error('Namespace "' + name + '" already declared.');
	}
	var namespace = name;
	while ((namespace = namespace.substring(0, 
		namespace.lastIndexOf('.')))) {
			this.ns[namespace] = true;
	}
	this.exportNamespace(name, obj);
};
/**
 * Implements a system for the dynamic resolution of dependencies
 * @param {string} ns Module to include, should match a 'provide'
 * in deps.js 
 */
__i__.require = function(ns) {
	// don't load more than once
	if(ns in this.amLoaded) return;
	var _path = this.getPathFromDeps(ns);
	if (_path) {
		this.included[_path] = true;
		this.writeScripts();
	} else {
		var errorMessage = '__i__.require could not find: ' + ns;
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
__i__.returnForName = {};
/**
 * Ref the Objects toString method so we can do some type checking
 * @private
 */
__i__.toStr = Object.prototype.toString;
/**
 * Callback for when a script has been injected and parsed
 * @private
 */
__i__.waitListener = function() {
	// use the path to get an object
	var obj = __i__.getDepsFromPath(this.getAttribute('src'));
	// the obj has 'provide' tokens as keys
	for(var k in obj) {
		// done in-loop to handle multiple provides per file
		__i__.amLoaded[k] = true;
	}
	// push the wait list through amDefined
	var waiting = __i__.amWaiting;
	// inf loop === bad
	__i__.amWaiting = {};
	for(var ns in waiting) {
		if(waiting.hasOwnProperty(ns)) {
			for(var dep in waiting[ns]) {
				__i__.amDefined(ns, dep, waiting[ns][dep]);
			}
		}
	}
};
/**
 * Resolution based on the dependencies added using addDependency
 * and calls _writeScriptTag accordingly.
 * @private
 */
__i__.writeScripts = function() {
	// the scripts we need to write this time
	var scripts = [];
	var seenScript = {};
	var deps = this.dependencies;

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
				} else if(!__i__.getNamespace(requireName)) {
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

	for(var path in this.included) {
		if(!deps.written[path]) {
			visitNode(path);
		}
	}
	for(var i = 0; i < scripts.length; i++) {
		if(scripts[i]) {
			this.writeScriptTag(scripts[i]);
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
__i__.writeScriptTag = function(src) {
	if(!this.dependencies.written[src]) {
		this.dependencies.written[src] = true;
		var script = this.doc.createElement('SCRIPT');
		script.setAttribute('src', src);
		// Handle gecko long-polling issue
		script.setAttribute('async', 'async');
		if(__i__.amIE) {
			script.onreadystatechange = function() {
				if(script.readyState == 'loaded'|| script.readyState == 'complete') {
					// don't respond twice...
					script.onreadystatechange = null;
					__i__.waitListener.call(script);
				}
			};	
		} else {
			// call _waitListener when loaded
			script.onload = __i__.waitListener;
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
	if(__i__.toStr.call(args[0]) === '[object String]') {
		ns = args.shift();
	}
	// now the '2nd' arg
	switch(__i__.toStr.call(args[0])) {
	case '[object Array]':
		// if we have a namespace provide it
		if(ns) {
			//TODO replace '/' with '.'
			__i__.provide(ns);
		} else ns = false;
		// __i__.parse can handle the primary use case here
		if(args[1] && typeof args[1] === 'function') {
			__i__.parse(ns, args[0], args[1]);
		} else throw Error('Unsupported use of dependencies');
		break;
	case '[object Function]':
		if(ns) {
			__i__.provide(ns);
			__i__.parse(ns, [], args[0]);
		} else throw Error('Anonymous define with only a function unsupported'); 
		break;
	case '[object Object]':
		// FIXME logic for getting filename clientside id not given
		if(!ns) {
			throw Error('Anonymous define with only an object unsupported');
		}
		// this will mixin the namespace to global and add the properties to it
		__i__.provide(ns, args[0]);
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
 * @link __i__.cache
 */
__cache__ = function() {__i__.cache.apply(__i__, arguments);};
/**
 * The counterpart of __cache__. The dependecies defined by the passed in
 * arguments will be injected.
 * @param {String | Array} namespace The provided name of a dependency to write
 * @link __i__.parse
 */
__parse__ = function() {__i__.parse.apply(__i__, arguments);};
/**
 * Alias for __i__.require
 * @param {String | Array} namespace A dependency to write
 * @link __i__.require
 */
window.require = function() {__i__.require.apply(__i__, arguments);};