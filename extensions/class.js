// Inheritance model based on J.Resig's simple inheritance, 
// appending to the __i__ namespace as __i__.Class
(function(I) {
	var INITIALIZING = false,
		// straight outta base2
		OVERRIDE = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

	// The base Class placeholder
	I.Class = function(){};
	// Create a new Class that inherits from this class
	I.Class.define = function(prop) {
		var _super = this.prototype;
		// Instantiate a base class (but only create the instance)
		INITIALIZING = true;
		var prototype = new this();
		INITIALIZING = false;

		var wrap = function(name, fn) {
			return function() {
				var tmp = this._super;
				// Add a new ._super() method that is the same method
				// but on the base class
				this._super = _super[name];
				// The method only need to be bound temporarily, so we
				// remove it when we're done executing
				var ret = fn.apply(this, arguments);
				this._super = tmp;
				return ret;
			};
		};

		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof prop[name] === "function" &&
			typeof _super[name] === "function" &&
			OVERRIDE.test(prop[name]) ? wrap(name, prop[name]) : prop[name];
		}

		// The dummy class constructor
		function Class() {
			// Initializing done in the constructor...
			if ( !INITIALIZING && this.ctor ) {
				this.ctor.apply(this, arguments);
			}
		}
		// Populate the constructed prototype object
		Class.prototype = prototype;
		// Enforce the constructor to be what we expect
		Class.constructor = Class;
		// And make this class 'define-able'
		Class.define = arguments.callee;
		Class.extend = Class.define; // sounds better for inherited classes
		return Class;
	};
}(__i__));
