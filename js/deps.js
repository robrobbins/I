// adds entries into the _dependencies hash that i.js uses to resolve calls to
// I.require(). The params are: (path-to-file, what-it-provides, what-it-requires).
// the path-to-file is relative to the i.js file. All of this is done by the
// Node.js depWriter utility, so you don't have to set these by hand though you
// can if you wish
I.addDependency('vendor/jquery.js', ['jquery'], [], true);
I.addDependency('site/test.js', ['TEST'], ['jquery'], false, true);
