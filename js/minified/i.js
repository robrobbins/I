var I=I||{};I.global=this;I.basePath="";I.doc=document;I.addDependency=function(a,c,b,d,f){var e;a=a.replace(/\\/g,"/");for(var g=this._dependencies,h=0;e=c[h];h++){g.nameToPath[e]=a;a in g.pathToNames||(g.pathToNames[a]={});g.pathToNames[a][e]=true}for(e=0;c=b[e];e++){a in g.requires||(g.requires[a]={});g.requires[a][c]=true}if(d)this._async[a]=true;if(f)this._defer[a]=true};
I.amDefined=function(a,c){var b;b=[];a=typeof a==="string"?a.split(">"):a;c=typeof c==="function"?[c]:c;for(var d;d=a.shift();)this.amLoaded(d)||b.push(d);if(b.length){b=b.length===1?b[0]:b.join(">");for(this._amWaitingChk(b)||(this._amWaiting[b]=[]);a=c.shift();)this._amWaiting[b].push(a)}else for(;b=c.shift();)b.call(this.global)};I._amWaiting={};I._amWaitingChk=function(a){return a in this._amWaiting};I._amLoaded={};I.amLoaded=function(a){return a in this._amLoaded};
I._waitListener=function(){var a=I._getDepsFromPath(this.getAttribute("path"));for(var c in a)I._amLoaded[c]=true;a=I._amWaiting;I._amWaiting={};for(var b in a)a.hasOwnProperty(b)&&I.amDefined(b,a[b])};I._exportPath=function(a,c,b){a=a.split(".");b=b||this.global;!(a[0]in b)&&b.execScript&&b.execScript("var "+a[0]);for(var d;a.length&&(d=a.shift());)if(!a.length&&c)b[d]=c;else b=b[d]?b[d]:(b[d]={})};
I.getObjectByName=function(a,c){a=a.split(".");c=c||this.global;for(var b;b=a.shift();)if(c[b])c=c[b];else return null;return c};I._getPath=function(){for(var a=this.doc.getElementsByTagName("script"),c=a.length-1;c>=0;--c){var b=a[c].src,d=b.length;if(b.substr(d-4)==="i.js"){I.basePath=b.substr(0,d-4);return}}};I.cache=function(){};I.execute=function(){};I._amCached={};
I.provide=function(a){if(I.getObjectByName(a)&&!I._ns[a])throw Error('Namespace "'+a+'" already declared.');for(var c=a;c=c.substring(0,c.lastIndexOf("."));)this._ns[c]=true;this._exportPath(a)};I.require=function(a,c,b){if(!I.getObjectByName(a)){var d=this._getPathFromDeps(a);if(d){this._included[d]=true;if(c)this._async[d]=true;if(b)this._defer[d]=true;this._writeScripts()}else{a="I.require could not find: "+a;this.global.console&&this.global.console.error(a);throw Error(a);}}};I._included={};
I._async={};I._defer={};I._dependencies={pathToNames:{},nameToPath:{},requires:{},visited:{},written:{}};I._getPathFromDeps=function(a){return a in this._dependencies.nameToPath?this._dependencies.nameToPath[a]:null};I._getDepsFromPath=function(a){return a in this._dependencies.pathToNames?this._dependencies.pathToNames[a]:null};I._ns={};
I._writeScripts=function(){var a=[],c={},b=this._dependencies;function d(e){if(!(e in b.written)){if(!(e in b.visited)){b.visited[e]=true;if(e in b.requires)for(var g in b.requires[e])if(g in b.nameToPath)d(b.nameToPath[g]);else if(!I.getObjectByName(g))throw Error("Undefined nameToPath for "+g);}if(!(e in c)){c[e]=true;a.push(e)}}}for(var f in this._included)b.written[f]||d(f);for(f=0;f<a.length;f++)if(a[f])this._writeScriptTag({src:this.basePath+a[f],path:a[f],async:this._async[a[f]]||false,defer:this._defer[a[f]]||
false});else throw Error("Undefined script input");};I._writeScriptTag=function(a){if(!this._dependencies.written[a.src]){this._dependencies.written[a.src]=true;var c=this.doc.createElement("SCRIPT");c.setAttribute("src",a.src);c.setAttribute("path",a.path);a.async&&c.setAttribute("async","async");a.defer&&c.setAttribute("defer","defer");c.onload=I._waitListener;c.onreadystatechange=function(){c.readyState=="complete"&&I._waitListener.call(c)};this.doc.getElementsByTagName("HEAD")[0].appendChild(c)}};
I._getPath();
