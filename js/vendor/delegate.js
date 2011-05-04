/*
 * jQuery delegate plug-in v1.0
 *
 * Copyright (c) 2007 Jörn Zaefferer
 *
 * $Id: jquery.delegate.js 4786 2008-02-19 20:02:34Z joern.zaefferer $
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function(a){a.each({focus:"focusin",blur:"focusout"},function(c,b){a.event.special[b]={setup:function(){if(a.browser.msie)return false;this.addEventListener(c,a.event.special[b].handler,true)},teardown:function(){if(a.browser.msie)return false;this.removeEventListener(c,a.event.special[b].handler,true)},handler:function(d){arguments[0]=a.event.fix(d);arguments[0].type=b;return a.event.handle.apply(this,arguments)}}});a.extend(a.fn,{delegate:function(c,b,d){return this.bind(c,function(f){var e=a(f.target);
	if(e.is(b))return d.apply(e,arguments)})},triggerEvent:function(c,b){return this.triggerHandler(c,[jQuery.event.fix({type:c,target:b})])}})})(jQuery);