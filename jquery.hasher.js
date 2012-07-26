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

;(function ($,win,doc,undefined){

var HasherResult = function(){
	this.parameters = {};
	this.nodes = [];
	this.hash = '';
	this.requested = '';
	this.path = '';
	this.search = '';
}
HasherResult.prototype = {hash:'',requested:'',path:'',parameters:null,nodes:null};

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
	if(s.indexOf(_history.basePath) == 0)
		s = s.substr(_history.basePath.length);
	
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
	var ary = s == '' ? [] : s.split('/');
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
	out.hash = _history.support?'': s + fp;
	out.path = _history.support && ('/'+s).indexOf(_history.basePath) == 0 ?('/'+s).substr(_history.basePath.length):  s;
	out.nodes = ary;
	out.requested = _history.basePath + out.path + fp;
	return out;
}

var _history ={};
_history.enabled = true;
_history.support = ( win.history && win.history.pushState && win.history.replaceState) ? true :false ;
_history.basePath= '';
_history.baseQuery = {};

var Hasher = {};
Hasher.events = {};
Hasher.events.change = 'hasher_change';
Hasher.history = _history;


Hasher.setBasePath = function(val){
	_history.basePath = val;
	check(true);
}

var last, current, nextAddr; 
last = current = new HasherResult();

var onBrowserHashChange = function(evt){
	check();
}
var onBrowserHistoryPopState = function(evt){
	check();
}
var isHistoryEnabled = function(){
	return _history.support && _history.enabled;
}
var enable = function(slient){
	$(win).bind('hashchange',onBrowserHashChange);
	$(win).bind('popstate',onBrowserHistoryPopState);
	if(!slient)
	check(slient);
}

var disable = function(){
	$(win).unbind('hashchange',onBrowserHashChange);
	$(win).unbind('popstate',onBrowserHistoryPopState);
}
var onAddrChange = function(){
	$(win).trigger(Hasher.events.change);
}
var change = function(addr,slient,title){
	last = current;
	
	nextAddr = addr;
	current = parsePath(addr, _history.baseQuery);
	
	if(!title) title = doc.title ? doc.title : '';
	
	if(isHistoryEnabled()){
		win.history.pushState(null, title, current.requested);
	}else{
		location.hash = addr;
	}
	
	if(last && last.path != current.path && !slient){
		onAddrChange();
	}
}
var check = function(slient){
	last = current;
	
	if(isHistoryEnabled()){
		nextAddr = location.href;
		current = parsePath(nextAddr);
		
		if(last && last.path != current.path && !slient)
			onAddrChange();
	}
	if(location.hash.length>0){
		
		nextAddr = location.hash;
		current = parsePath(nextAddr);
		
		if(last && last.path != current.path && !slient)
			onAddrChange();
	}
}

Hasher.enable = enable;
Hasher.disable = disable;
Hasher.check = check;
Hasher.change = change;

Hasher.current = function(){return current;}
Hasher.last = function(){return last;}

Hasher.utils = {};
Hasher.utils.urlQueryToObject = urlQueryToObject;
Hasher.utils.parsePath = parsePath;

$.hasher= Hasher;
win.Hasher = Hasher;


if(_history.basePath == null) _history.basePath = location.pathname;
if(_history.baseQuery == null) _history.baseQuery =  urlQueryToObject(location.search);

})(jQuery,window,document);