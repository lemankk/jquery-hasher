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
}
HasherResult.prototype = {
	hash:'',
	requested:'',
	path:'',
	search:'',
	parameters:null,
	nodes:null,
	node: function(idx){
		if(!idx ) idx = 0;
		if(idx<0) idx = this.nodes.length + idx;
		if(this.nodes.length > idx && idx >=0 ) return this.nodes[idx];
		return null;
	},
	parameter: function(key){
		if(!key ) return null;
		if(this.parameters && typeof this.parameters[key] != 'undefined') return this.parameters[key];
		return null;
	}
};

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
var parsePath = function(path, addiotnalSearchParameter){
	if(!path){
		path = '';
	}
	var s = String(path);
	
	var out = new HasherResult();
	
	if(typeof addiotnalSearchParameter != 'object')
		addiotnalSearchParameter = null;
	else{
		for(key in addiotnalSearchParameter){
			out.parameters[key] = addiotnalSearchParameter[key];
		}
	}
	
	var hashStr = null;
	var hashParameterStr = null;
	var posStr = s.indexOf('#');
	if(posStr>=0){
		hashStr = s.substr(posStr+1);
		s = s.substr(0,posStr);
		
		posStr = hashStr.indexOf('?');
		if(posStr>=0){
			hashParameterStr = hashStr.substr(posStr + 1);
			hashStr = hashStr.substr(0,posStr);
		}
	}
	var parameterStr = '';
	posStr = s.indexOf('?');
	if(posStr>=0){
		parameterStr = s.substr(posStr + 1);
		s = s.substr(0,posStr);
	}
	
	// remove head slash
	if(s.substr(0,1) == '/'){
		s = s.substr(1);
	}
	
	if(isHistoryEnabled()){
		var _basePath = String(_history.basePath);
		// Bug fix : when the requested path act as directory and 
		// pass without slash at the tail
		// we assume that is same directory
		// For example : 
		// Requested: /some/where/path
		// Base Path: /some/where/path/
		// Then the requested path will be same as base path
		if(_basePath.substr(-1,1) == '/' && _basePath.substr(0,_basePath.length-1) == s)
			s = '';
		else if(s.indexOf(_basePath) == 0)
			s = s.substr(_basePath.length);
	
		// remove head slash
		if(s.substr(0,1) == '/'){
			s = s.substr(1);
		}
	}else{
		if(hashStr == null)
			hashStr = s;
		else
			s = hashStr;
	}
	
	// split path into an array by slash
	var ary = s == '' ? [] : s.split('/');
	var key , val;
	
	if(parameterStr && parameterStr.length > 0){
		urlQueryToObject( parameterStr, out.parameters);
	}
	if(hashParameterStr && hashParameterStr.length > 0){
		urlQueryToObject( hashParameterStr, out.parameters);
	}
	
	var mergedParameterStr = '';
	for(key in out.parameters){
		mergedParameterStr+= mergedParameterStr.length > 0?'&':'';
		mergedParameterStr+= key+'='+escape(out.parameters[key]);
	}
	
	out.search = mergedParameterStr;
	out.hash = hashStr;
	out.hashParameter = hashParameterStr;
	out.path = s;
	out.nodes = ary;
	out.requested = _history.basePath + out.path;
	if(mergedParameterStr!='') out.requested += '?'+mergedParameterStr;
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
var change = function(addr,slient){
	if(typeof addr == 'undefined') return;
	
	last = current;
	
	
	nextAddr = addr;
	current = parsePath(addr, _history.baseQuery);
	
	var title = $.hasher.getTitle(current);
	
	try{
		document.title = title;
	}catch(error){}
	
	if(isHistoryEnabled()){
		win.history.pushState(null, title, current.requested);
	}else{
		location.hash = current.path;
	}
	
	if(last && last.path != current.path && !slient){
		onAddrChange();
	}
}
var replace = function(addr){
	if(typeof addr == 'undefined') return;
	nextAddr = addr;
	current = parsePath(addr, _history.baseQuery);
	
	var title = $.hasher.getTitle(current);
	
	try{
		document.title = title;
	}catch(error){}
	
	if(isHistoryEnabled()){
		win.history.replaceState(null, title, current.requested);
	}else{
		location.hash = current.path;
	}
} 
var check = function(slient){
	last = current;
	
	if(isHistoryEnabled()){
		nextAddr = location.href;
		current = parsePath(nextAddr);
		
		if( !slient)
			if(!last || last.path != current.path || Hasher.notifyIfNoChange)
				onAddrChange();
	}
	if(location.hash.length>0){
		
		nextAddr = location.hash;
		current = parsePath(nextAddr);
		
		if( !slient)
			if(!last || last.path != current.path || Hasher.notifyIfNoChange)
				onAddrChange();
	}
}

Hasher.getTitle = function(){return doc.title;}

Hasher.enable = enable;
Hasher.disable = disable;
Hasher.check = check;
Hasher.change = change;
Hasher.replace = replace;
Hasher.notifyIfNoChange = true;
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