/**
 * This file is a part of JOMM library (https://github.com/davidjegat/JOMM.git). Please
 * read the LICENSE or README.md files for more informations about this 
 * software.
 *
 * @author david jegat <david.jegat@gmail.com>
 */

/**
 * Modified the string prototype to add some usefull
 * methods.
 *
 * @param mixed toAppend
 * @return JSON
 */
String.prototype.explodeJSON = function(toAppend)
{
	if( this.length == 0 ){
		if(toAppend != undefined){
			return toAppend;
		}
		return {};
	}

	var memory = this.split(".");
	var tmp = memory.shift();
	var object = {};

	object[tmp] = memory.join(".").explodeJSON(toAppend);
	return object;
}

/**
 * Add the jsonHasKey method to the window. This method is
 * recursive.
 *
 * @param object json
 * @param string key
 */
window.jsonGetKey = (function()
{
	var keyGet = function(json, exploder)
	{
		if(exploder.length == 0 || json == undefined){
			return json;
		}

		var first = exploder.shift();
		return keyGet(json[first], exploder);
	}

	return function(json, key)
	{
		return keyGet(json, key.split("."));
	}
})();

/**
 * Copy an object and return this copy.
 *
 * @param object json
 * @return object
 */
window.jsonCopy = function(json)
{
	var r = {};
	for (k in json){
		r[k] = json[k];
	}
	return r;
}


/**
 * JOMM (Javascript Object and Module Manager) is a simple and complete
 * javascript module that allow you to manage Modules, Class and many
 * other stuff with asynchronous script loader and many more stuffs.
 *
 * @author david jegat <david.jegat@gmail.com>
 */
var JOMM = (function(o){
	
	var self = o;

	/**
	 * @param object container
	 * @access public
	 */
	self.container = {};

	/**
	 * Add a prototype to the given container
	 *
	 * @param object json, the container
	 * @param object nms, to append
	 * @return json
	 */
	self.addPrototypeTo = function(json, nms)
	{
		for(n in nms){
			if(json[n] == undefined){
				json[n] = nms[n];
			} else {
				self.addPrototypeTo(json[n], nms[n]);
			}
		}
	}

	/**
	 * Return a class prototype
	 *
	 * @return object
	 */
	self.get = function(className)
	{
		return window.jsonGetKey(self.container, className);
	}

	/**
	 * Get a given module
	 *
	 * @param string mod
	 * @return object
	 */
	self.getModule = function(mod)
	{
		if(!self.get(mod)){
			console.error("JOMM Oups! No module named "+mod+" has been found");
			return {};
		}

		self.launch(mod);

		return self.get(mod).__module__;
	}

	/**
	 * Instanciate a given class by parse all this method and 
	 * create a closure for the object Python way (self has first
	 * parameter).
	 *
	 * @param object prototype
	 * @return object, the instanciate one
	 */
	self.instanciate = function(prototype)
	{
		var instance = Object.create(prototype);
		// Parse the methods :
		for(i in instance){
			if(typeof instance[i] == "function") {
				instance[i] = new (function(obj, className, methodName)
				{
					this.obj = obj;
					this.name = className;
					this.method = methodName;

					var __ = this;

					var closure = function()
					{
						var origin = JOMM.get(__.name+"."+__.method);
						var args = [__.obj].concat(Array.prototype.slice.call(arguments));
						return origin.apply(__.obj, args);
					}

					return closure;
				})(instance, instance.__name__, i);
			}
		}

		return instance;
	}

	/**
	 * Inherit a given object with the special attributes 
	 * "extends".
	 *
	 * @param object object
	 * @return object, the inherit object
	 */
	self.inherit = function(object)
	{
		if(typeof object.extends != "string"){
			return object;
		}
		// get the parent class :
		var parentClass = self.inherit(self.instanciate(self.get(object.extends)));

		// do the extends
		for(i in parentClass){
			if(object[i] == undefined){
				object[i] = parentClass[i];
			} else {
				if(typeof object[i] == "function"){
					object[i] = new (function(obj, className, methodName, parent){

						this.obj = obj;
						this.name = className;
						this.method = methodName;
						this.parent = parent;

						var __ = this;

						var parentMethod = function()
						{
							return parent.apply(__.obj, Array.prototype.slice.call(arguments));
						}

						var closure = function()
						{
							var origin = JOMM.get(__.name+"."+__.method);
							var args = [__.obj, parentMethod].concat(Array.prototype.slice.call(arguments));
							return origin.apply(__.obj, args);
						}

						return closure;


					})(object, object.__name__, i, parentClass[i]);
				}
			}
		}

		return object;
	}

	/**
	 * Checking if a given object implements corectly an interface
	 *
	 * @param object obj
	 * @return boolean
	 */
	self.implements = function(obj)
	{
		// get the interface :
		var interfaces = obj.implements || [];
		if(typeof interfaces != "object" || interfaces.length == 0){
			return true;
		}
		// Loop on each interfaces :
		for(i in interfaces){
			var interPrototype = self.get(interfaces[i]);
			// loop on each members :
			for (m in interPrototype){
				if(m.search(/^__(.*)__$/) == 0){
					continue;
				}
				if(obj[m] == undefined){
					console.error("JOMM Oups! Object "+obj.__name__+" must implements the member "+m+"("+
						interPrototype[m]+") !");
					return false;
				} else if(typeof obj[m] != interPrototype[m]) {
					console.error("JOMM Oups! Object "+obj.__name__+" implements the member "+m+" but with "+
						"the wrong type ("+typeof obj[m]+" instead of "+interPrototype[m]+")");
					return false;
				}
			}

		}

		// All is OK !
		return true;
	}

	/**
	 * create an interface
	 *
	 * @param string name
	 * @param object interface
	 * @return JOMM
	 */
	self.interface = function(name, interface)
	{
		// Add the name to the prototype
		interface.__name__ = name;
		interface.__type__ = "interface";
		var namespace = name.explodeJSON(interface);
		// Check interface integration:
		for(m in interface){
			if(typeof interface[m] != "string"){
				console.error("JOMM Oups! Bad value fo interface "+name+" on the member "+m+
					". An interface member must return a string, please visits the official JOMM "+
					"documentation for more informations.");
				return self;
			}
		}
		// Add to the container
		self.addPrototypeTo(self.container, namespace);

		return self;
	}

	/**
	 * Create a module.
	 *
	 * @param string identifier
	 * @param function module
	 * @param * arguments ...
	 * @return JOMM
	 */
	self.module = function(identifier, module)
	{
		// checking module type
		if(typeof module != "function"){
			console.error("JOMM Oups! A module must be a function type ("+typeof module+
				" given)");
			return self;
		}

		var proto = {
			__name__: identifier,
			__type__: "module",
			__function__: module,
			__arguments__: Array.prototype.slice.call(arguments, 2),
			__module__: null
		};

		// Dispatch into JSON the class name
		var namespace = identifier.explodeJSON(proto);
		// Add to the container
		self.addPrototypeTo(self.container, namespace);

		return self;
	}

	/**
	 * Initialise the given action schemes.
	 *
	 * @param object schemes
	 * @return JOMM
	 */
	self.run = function(schemes)
	{
		if(typeof schemes != "object"){
			return self;
		}

		// loop on each modules
		for(mod in schemes){
			// try to launch it
			self.launch(mod);
			// loop on method :
			for(method in schemes[mod]){
				self.launch(mod, method, schemes[mod][method]);
			}
		}

		return self;
	}

	/**
	 * run a given module method or just instanciate them if no method
	 * is given.
	 *
	 * @param string module
	 * @param [ string method ], the method
	 * @param object argus, method arguments
	 * @return JOMM
	 */
	self.launch = function(module, method, argus)
	{
		var args = argus || [];
		// get the prototype :
		var m = self.get(module);
		if(!m){
			console.error("JOMM Oups! No module named "+module+" has been found !");
			return self;
		}
		// Check if it's a correct module :
		if(m.__type__ == undefined || m.__type__ != "module"){
			console.error("JOMM Oups! "+module+" isn't a module ("+module.__type__+")");
			return self;
		}
		// Instanciate them if it's not
		if(!m.__module__){
			m.__module__ = m.__function__.apply(null, m.__arguments__);
			if(!self.implements(m.__module__)){
				return self;
			}
		}
		// Call the method if it's defined :
		if(method != undefined && typeof method == "string"){
			if(m.__module__[method] == undefined){
				console.warn("JOMM Caution! Module "+module+" has no member name "+method);
			} else if(typeof m.__module__[method]!= "function"){
				console.warn("JOMM Caution! Module "+module+" has no method name "+method);
			} else {
				m.__module__[method].apply(m.__module__, args);
			}
		}

		return self;
	}


	/**
	 * Create a class
	 *
	 * @param string className
	 * @param object prototype
	 * @return JOMM
	 */
	self.class = function(className, prototype)
	{
		// Add the name to the prototype :
		prototype.__name__ = className;
		prototype.__type__ = "class";
		// Dispatch into JSON the class name
		var namespace = className.explodeJSON(prototype);
		// Add to the container
		self.addPrototypeTo(self.container, namespace);

		return self;
	}

	/**
	 * Instanciate a class with the given parameter
	 *
	 * @param string className
	 * @param *, the arguments
	 * @return object
	 */
	self.new = function(className)
	{
		// get the class
		var prototype = self.get(className);

		// check interface and abstract class
		if(prototype.__type__ != "class"){
			console.error("JOMM Oups! You can't instanciate "+prototype.__type__+" class type.");
			return {};
		}

		// create object
		var object = self.inherit(self.instanciate(prototype));

		// check implementation
		if(!self.implements(object)){
			return {};
		}

		// construct object
		if(object.init != undefined && typeof object.init == "function"){
			object.init.apply(object, Array.prototype.slice.call(arguments, 1));
		}

		return object;
	}

	/**
	 * This method display on the console the container debuging
	 *
	 * @param object container
	 * @return JOMM
	 */
	self.debug = function(container, level)
	{
		var ct = container || self.container;
		var t = level || "";
		for(e in ct){
			if(ct[e].__type__ == undefined){
				console.log(t + e + " - package :");
				self.debug(ct[e], t + "\t");
			} else {
				console.log(t + "> " + e + " - "+ct[e].__type__);
			}
		}
	}
 
	return self;
})({});