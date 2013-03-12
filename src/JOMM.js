/**
 * This file is a part of JOMM library (https://github.com/davidjegat/JOMM.git). Please
 * read the LICENSE or README.md files for more informations about this 
 * software.
 *
 * @author david jegat <david.jegat@gmail.com>
 */

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
		return self.Utilities.jsonGetKey(self.container, className);
	}

	/**
	 * Get a given module
	 *
	 * @param string mod
	 * @param boolean warn = true
	 * @return object
	 */
	self.getModule = function(mod, warn)
	{
		if(warn == undefined){
			warn = true;
		}

		if(!self.get(mod)){
			console.error("JOMM Oups! No module named "+mod+" has been found");
			return {};
		}

		if(typeof self.get(mod).__module__ == "undefined"){
			// try to get the module that is name like the package
			// ex : Foo.Package -> try to get : Foo.Package.Package module
			var pack = mod.split(".").pop();
			if(typeof self.get(mod)[pack] !== "undefined"){
				if(!self.get(mod)[pack].__module__ && warn){
					console.warn("JOMM caution! You tried to get a Module that is not initiliaze.");
				}
				var module = self.get(mod)[pack];
			} else {
				console.error("JOMM Oups! No module named "+mod+" has been found");
				return {};
			}
			
		} else if(!self.get(mod).__module__){
			if(warn){
				console.warn("JOMM caution! You tried to get a Module that is not initiliaze.");
			}
			var module = self.get(mod);
		} else {
			var module = self.get(mod);
		}
		if(warn){
			return module.__module__;
		} else {
			return module;
		}
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
		var namespace = self.Utilities.explodeJSON(name, interface);
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
		var namespace = self.Utilities.explodeJSON(identifier, proto);
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
			self.init(mod, schemes[mod]);
		}

		return self;
	}

	/**
	 * run a given module method or just instanciate them if no method
	 * is given.
	 *
	 * @param string module
	 * @param [ object options ]
	 * @return JOMM
	 */
	self.init = function(module, options)
	{
		var opts = options || {};
		// get the prototype :
		var m = self.getModule(module, false);
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
		}
		// Call the init method :
		if(m.__module__.init && typeof m.__module__.init == "function"){
			m.__module__.init(opts);
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
		// prototype.__name__ = className;
		// prototype.__type__ = "class";
		prototype = self.Utilities.createPrototype(prototype, className, "class");
		// Dispatch into JSON the class name
		var namespace = self.Utilities.explodeJSON(className, prototype);
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

/**
 * This JOMM subModule defined some usefull functions for
 * JSON and String enhancement.
 *
 * @author david jegat <david.jegat@gmail.com>
 */
JOMM.Utilities = (function()
{

	var self = {};

	/**
	 * Explode a given string to a json
	 *
	 * @param string toExplode
	 * @param mixed toAppend
	 * @return JSON
	 */
	self.explodeJSON = function(toExplode, toAppend)
	{
		if( toExplode.length == 0 ){
			if(toAppend != undefined){
				return toAppend;
			}
			return {};
		}

		var memory = toExplode.split(".");
		var tmp = memory.shift();
		var object = {};

		object[tmp] = self.explodeJSON(memory.join("."), toAppend);
		return object;
	}

	/**
	 * Get a key from a json with a string as key
	 * getter. This method is recursive.
	 *
	 * @param object json
	 * @param string key
	 * @return mixed
	 */
	self.jsonGetKey = (function()
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
	 * Test two string instance between us
	 *
	 * @param string a
	 * @param string b
	 */
	self.instanceOf = function(a, b)
	{
		var objectA = JOMM.get(a);
		var objectB = JOMM.get(b);
		if( !objectA || objectA.__name__ != a ||
			!objectB || objectB.__name__ != b) {
			console.error("JOMM Oups! Bad value for JOMM.Utilities.instanceOf !");
			return false;
		}

		if(objectA.__type__ == "class" && objectB.__type__ == "class"){

			if(objectA.__name__ == objectB.__name__){
				return true;
			}
			var recParentTest = function(c, p){
				if(!c.extends){
					return false;
				}
				if(c.extends == p.__name__){
					return true;
				}
				if(!p.extends){
					return false;
				}
				return recParentTest(p, JOMM.get(p.extends));
			}
			return recParentTest(objectA, objectB);

		} 
		return false;
	}

	/**
	 * Test two string instance between us and see if one implement
	 * the other.
	 *
	 * @param string obj
	 * @param string interface
	 */
	self.implement = function(obj, interface)
	{
		var proto = JOMM.get(obj);
		var inter = JOMM.get(interface);
		if( !proto || proto.__name__ != obj ||
			!inter || inter.__name__ != interface) {
			console.error("JOMM Oups! Bad value for JOMM.Utilities.implement !");
			return false;
		}

		if(proto.__type__ == "class" && inter.__type__ == "interface"){
			for(i in proto.implements){
				if(proto.implements[i] == inter.__name__){
					return true;
				}
			}
			if(proto.extends){
				return self.implement(proto.extends, inter.__name__);
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	/**
	 * Create a corect prototype for a class, interface or a module
	 * too. Add some special methods to class.
	 *
	 * @param object prototype
	 * @param string name
	 * @param string type
	 */
	self.createPrototype = function(prototype, name, type)
	{
		prototype.__name__ = name;
		prototype.__type__ = type;
		// Add method to the class :
		if(type == "class"){
			prototype.instanceOf = function(o, object){
				if(typeof object == "function" && arguments.length > 2) {
					object = arguments[2];
				}
				if(typeof object == "object" && object.__name__){
					var name = object = object.__name__;
				} else {
					var name = object;
				}

				return JOMM.Utilities.instanceOf(o.__name__, name);
			},
			prototype.implement = function(o, object){
				if(typeof object == "function" && arguments.length > 2) {
					object = arguments[2];
				}
				if(typeof object == "object" && object.__name__){
					var name = object = object.__name__;
				} else {
					var name = object;
				}

				return JOMM.Utilities.implement(o.__name__, name);
			}
		}

		return prototype;
	}


	return self;

})();

// Export for NODE :
if(typeof module !== "undefined"){	
	if(module != undefined && module.exports != undefined){
		module.exports = JOMM;
	}	
}