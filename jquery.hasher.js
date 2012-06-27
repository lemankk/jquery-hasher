/*
jQuery - hasher
Address changing handler (Location Hash & History API Support)


Author: Leman K. from LMSWork
Author URL: http://lmsmade.com/


License: http://creativecommons.org/licenses/by-sa/3.0/ (Attribution Share Alike). Please attribute work to Leman simply by leaving these comments in the source code or if you'd prefer, place a link on your website to http://lmsmade.com/.

Dual licensed under the MIT and GPL licenses:
http://www.opensource.org/licenses/mit-license.php
http://www.gnu.org/licenses/gpl.html
//*/

var Hasher = {};
Hasher.current = null;
Hasher.last = null;

Hasher.change = function(addr,slient,title) {}

Hasher.events = {};
Hasher.events.change = 'hasher_change';

Hasner.history ={};
Hasher.history.support = ( window.history && window.history.pushState && window.history.replaceState) ;
Hasher.history.basePath= '';
Hasher.history.baseQuery = {};

/**/;(function ($){

var HasherResult = function(){
	this.parameters = {};
	this.nodes = [];
	this.hash = '';
	this.requested = '';
	this.path = '';
	this.search = '';
}
HasherResult.prototype = {hash:'',requested:'',path:'',parameters:null,nodes:null};

var last, current, lastAddr; 
last = current = new HasherResult();

var onBrowserHashChange = function(evt){
	check();
}
var onBrowserHistoryPopState = function(evt){
	check();
}
var enable = function(slient){
	$(window).bind('hashchange',onBrowserHashChange);
	$(window).bind('popstate',onBrowserHistoryPopState);
	if(!slient)
	check();
}

var disable = function(){
	$(window).unbind('hashchange',onBrowserHashChange);
	$(window).unbind('popstate',onBrowserHistoryPopState);
}
var onAddrChange = function(){
	$(window).trigger(Hasher.events.change);
}
var change = function(addr,slient,title){
	last = current;
	
	nextAddr = addr;
	current = parsePath(nextAddr, Hasher.history.baseQuery);
	
	if(!title) title = document.title ? document.title : '';
	
	if(Hasher.historyPushSupport){
		window.history.pushState(null, title, current.requested);
	}else{
		location.hash = addr;
	}
	
	Hasher.last = last;
	Hasher.current = current;
	
	if(last && last.path != current.path && !slient){
		onAddrChange();
	}
}
var urlQueryToObject = function(p){
	if(typeof p == 'object')return p;
	var out = arguments.length > 1 ? arguments[1] : null;
	
	// if no object passed, then we create a new one.
	if(!out) out = {};
	
	// Change to string object
	p = ''+p;
		
	if(p.substr(0,1) == '?') p = p.substr(1);
	
	if(p && p.length > 0){
		var pa = p.split('&');
		$(pa).each(function(idx,str){
			
			var ps = str.indexOf('=');
			if(ps >0){
				key = str.substr(0,ps);
				val = str.substr(ps+1);
			}else{
				key = str;
				val = '';
			}
			
			out[key] = val;
		});
	}
	return out;
}
var parsePath = function(s){
	var sp = arguments.length > 1 ? arguments[1] : null;
	var out = new HasherResult();
	out.requested = s;
	
	var p = '';
	var ps = s.indexOf('#');
	if(ps>=0){
		s = s.substr(ps+1);
	}
	if(s[0] == '/'){
		s = s.substr(1);
	}
	ps = s.indexOf('?');
	if(ps>=0){
		p = s.substr(ps + 1);
		s = s.substr(0,ps);
	}
	var ary = s.split('/');
	var key , val;
	if(sp && typeof sp =='object'){
		for(key in sp){
			out.parameters[key] = sp[key];
		}
	}
	if(p && p.length > 0){
		urlQueryToObject( p, out.parameters);
	}
	var fp = '';
	for(key in out.parameters){
		fp+= fp.length > 0?'&':'?';
		fp+= key+'='+escape(out.parameters[key]);
	}
	out.search = fp;
	out.hash = Hasher.history.support?'': s + fp;
	out.path = Hasher.history.support? ('/'+s).substr(Hasher.history.basePath.length):  s;
	out.nodes = ary;
	out.requested = Hasher.history.basePath + out.path + fp;
	return out;
}
var check = function(slient){
	last = current;
	
	if(Hasher.history.support){
		nextAddr = location.pathname + location.search;
		current = parsePath(nextAddr);
		
		Hasher.current = current;
		Hasher.last = last;
		
		if(last && last.path != current.path && !slient)
			onAddrChange();
	}
	if(location.hash.length>0){
		
		nextAddr = location.hash;
		current = parsePath(nextAddr);
		
		Hasher.current = current;
		Hasher.last = last;
		
		if(last && last.path != current.path && !slient)
			onAddrChange();
	}
}

Hasher.enable = enable;
Hasher.disable = disable;
Hasher.check = check;
Hasher.change = change;
Hasher.current = current;
Hasher.last = last;

$(document).ready(function(){
	if(Hasher.history.basePath == null) Hasher.history.basePath = location.pathname;
	if(Hasher.history.baseQuery == null) Hasher.history.baseQuery =  urlQueryToObject(location.search);

	enable(true);
	check(true);
});

$.hasher= Hasher;
})(jQuery);