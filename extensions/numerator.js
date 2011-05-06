define('__i__.Numerator', ['__i__.numerable', 'class'], function(num, C) {
	
	__i__.Numerator = C.define({
		ctor: function(it) {
			// TODO typecheck it?
			this.iterable = it;
			this.begin = 0;
			this.end = it.length;
			this.index = 0;
			this.last_move = 0;
		},
		next: function(k, v, n) {
				this._chkIndex(2);
				if(this.last_move === 1) {
						this._setIndex(2);
						this.last_move = 2;
						return this.next(k,v,n);
				} else {
						var val = this._get(k, v, n);
						this._setIndex(2);
						this.last_move = 2;
				}
				return val;
		},
		nextKey: function() {
				return this.next(true);
		},
		nextVal: function() {
				return this.next(false, true);
		},
		previous: function(k, v, n) {
				this._chkIndex(1);
				if(this.last_move === 2) {
						this._setIndex(1);
						this.last_move = 1;
						return this.previous(k,v,n);
				} else {
						this._setIndex(1);
						this.last_move = 1;
				}
				return this._get(k, v, n);
		},
		previousKey: function() {
				return this.previous(true);
		},
		previousVal: function() {
				return this.previous(false, true);
		},
		toBegin: function() {
				this.index = this.begin;
		},
		toEnd: function() {
				this.index = this.end;
		},
		_chkIndex: function(d) {
				if(d === 2) {
						if(this.index === this.end) {
								throw num.StopIteration;
						}
				} else {
						if(this.index === this.begin) {
								throw num.StopIteration;
						}
				}
		},
		_get: function(k,v,n) {
				var b, a = this.iterable[this.index];
				if(k) {
						b = a[0];
				} else if(v) {
						if(!typeof a.length === 'number' || a.length < 2) {
								throw num.StopIteration;
						}
						b = a[1];
				} else if(n) {
						if(!typeof a.length === 'number' || n > (a.length - 1)) {
								throw num.StopIteration;
						}
						b = a[n];
				}
				return b ? b : a;
		},
		_setIndex: function(d) {
				d === 2 ? this.index += 1 : this.index -= 1;
		}
	});
	return __i__.Numerator;
});