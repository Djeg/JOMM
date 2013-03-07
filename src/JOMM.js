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
 * JOMM (Javascript Object and Module Manager) is a simple and complete
 * javascript module that allow you to manage Modules, Class and many
 * other stuff with asynchronous script loader and many more stuffs.
 *
 * @author david jegat <david.jegat@gmail.com>
 */
var JOMM = (function(o){
	
	var self = o;

	/**
	 * @var JSON modules, the modules
	 * global namespace
	 * @access public
	 */
	self.Module = {};

	/**
	 * @var JSON Class, The class namespace. This namespace store
	 * all the defined project class.
	 */
	self.Class = {};

	/**
	 * @var JSON Option, The global options for JOMM.
	 * @access public
	 */
	self.Option = {};

	/**
	 * @var Array _registers, contains a list of module ready to be
	 * launched.
	 * @access public
	 */
	self._registers = [];

	/**
	 * Add an option to the given offset
	 *
	 * @param string offset
	 * @param mixed  options
	 * @return JOMM
	 */
	self.addOption = function(offset, option)
	{
		namespace = offset.explodeJSON(option);

		for(i in namespace){
			self.Option[i] = namespace[i];
		}

		return self;
	}

	/**
	 * Get the option at the given offset. The offset
	 * can be recursive ("Foo.Bar").
	 *
	 * @param string offset
	 * @param json [ checker ]
	 * @return mixed or null if no option exists
	 */
	self.getOption = function(offset, checker)
	{
		if(offset.length == 0){
			return (checker == undefined) ? null : checker;
		}

		if(checker == undefined){
			if(!self.hasOption(offset)){
				return null;
			} else {
				checker = self.Option;
			}
		}

		var exploder = offset.split(".");
		var idObject = offset.explodeJSON();
		var i = exploder.shift();
		return self.getOption(exploder.join("."), checker[i]);
	}

	/**
	 * Test if an option exists
	 *
	 * @param string offset
	 * @param json [ checker ]
	 * @return boolean
	 */
	self.hasOption = function(offset, checker)
	{
		if(offset.length == 0){
			return (checker == undefined) ? false : true;
		}

		if(checker == undefined){
			checker = self.Option;
		}

		var exploder = offset.split(".");
		var idObject = offset.explodeJSON();

		for(i in idObject){
			if(checker[i] == undefined){
				return false;
			}
		}
		exploder.shift();
		return self.hasOption(exploder.join("."), checker[i]);
	}

	/**
	 * Test if a module exists
	 *
	 * @param string identifier
	 * @param json [ checker ]
	 * @return boolean
	 */
	self.hasModule = function(identifier, checker)
	{
		if(identifier.length == 0){
			return (checker == undefined) ? false : true;
		}

		if(checker == undefined){
			checker = self.Module;
		}

		var exploder = identifier.split(".");
		var idObject = identifier.explodeJSON();

		for(i in idObject){
			if(checker[i] == undefined){
				return false;
			}
		}
		exploder.shift();
		return self.hasModule(exploder.join("."), checker[i]);
	}

	/**
	 * Test if a Class exists
	 *
	 * @return boolean
	 */
	self.hasClass = function(identifier, checker)
	{
		if(identifier.length == 0){
			return (checker == undefined) ? false : true;
		}

		if(checker == undefined){
			checker = self.Class;
		}

		var exploder = identifier.split(".");
		var idObject = identifier.explodeJSON();

		for(i in idObject){
			if(checker[i] == undefined){
				return false;
			}
		}
		exploder.shift();
		return self.hasClass(exploder.join("."), checker[i]);
	}

	/**
	 * Return the module by this string identifier
	 *
	 * @param string identifier
	 * @param json   [ checker ]
	 * @return json
	 */
	self.getModule = function(identifier, checker)
	{
		if(identifier.length == 0){
			return (checker == undefined) ? null : checker;
		}

		if(checker == undefined){
			if(!self.hasModule(identifier)){
				return null;
			} else {
				checker = self.Module;
			}
		}

		var exploder = identifier.split(".");
		var idObject = identifier.explodeJSON();

		for(i in idObject){
			if(checker[i] == undefined){
				return false;
			}
		}
		exploder.shift();
		return self.getModule(exploder.join("."), checker[i]);
	}

	/**
	 * Return the class by this strong identifier
	 *
	 * @param string identifier
	 * @param json [ checker ]
	 * @return Class
	 */
	self.getClass = function(identifier, checker)
	{
		if(identifier.length == 0){
			return (checker == undefined) ? null : checker;
		}

		if(checker == undefined){
			if(!self.hasClass(identifier)){
				return null;
			} else {
				checker = self.Class;
			}
		}


		var exploder = identifier.split(".");
		var idObject = identifier.explodeJSON();

		for(i in idObject){
			if(checker[i] == undefined){
				return false;
			}
		}
		exploder.shift();
		return self.getClass(exploder.join("."), checker[i]);
	}

	/**
	 * Create a module and store it into the JOMM.Module
	 *
	 * @param string identifier
	 * @param json   module
	 *
	 * @return JOMM
	 */
	self.createModule = function(identifier, module)
	{
		var namespace = identifier.explodeJSON(module);

		// concatenate too JOMM.Module
		for(k in namespace) {
			if(self.Module[k] == undefined) {
				self.Module[k] = namespace[k];
			} else {
				for(i in namespace[k]){
					self.Module[k][i] = namespace[k][i];
				}
			}
		}

		return self;
	}

	/**
	 * Create a class.
	 *
	 * @param string identifier
	 * @param json   class
	 * @return JOMM
	 */
	self.createClass = function(identifier, module)
	{
		var namespace = identifier.explodeJSON(module);

		// concatenate to the class
		for(k in namespace) {
			if(self.Class[k] == undefined) {
				self.Class[k] = namespace[k];
			} else {
				for(i in namespace[k]){
					self.Class[k][i] = namespace[k][i];
				}
			}
		}

		return self;
	}

	/**
	 * Instanciate a class with the given argument
	 *
	 * @param string identifier
	 * @param [ * ], the object arguments
	 */
	self.new = function(identifier)
	{
		if(typeof identifier == "string") {
			identifier = self.getClass(identifier);	
		}

		if(typeof identifier == "function"){
			var instance = new identifier();
		} else if (typeof identifier == 'object') {
			var instance = Object.create(identifier);
		}

		if(instance["parent"] != undefined){
			if(typeof instance["parent"] == "string"){
				var parent = self.getClass(instance['parent']);
				self.inherit(instance, parent);
			} else if(typeof instance["parent"] == "object"){
				var parent = instance["parent"];
				self.inherit(instance, parent);
			} else {
				console.error("JOMM Oups! Bas value for class.parent ("+ 
					typeof instance["parent"]+
					", string or object expected).");
			}
		}

		if(typeof instance['init'] == 'function') {
			var args = Array.prototype.slice.call(arguments);
			args.shift();
			instance.init.apply(instance, args);
		}

		return instance;
	}

	/**
	 * This method add a module on the register
	 *
	 * @param string|json module
	 * @return JOMM
	 */
	self.register = function(module)
	{
		if(typeof module == "string"){
			module = self.getModule(module);
			if(!module){
				return self;
			}
		}

		self._registers.push(module);
		return self;
	}

	/**
	 * Test if the given module is always registered
	 *
	 * @param string|json module
	 * @return boolean
	 */
	self.isRegister = function(module)
	{
		if(typeof module == "string"){
			module = self.getModule(module);
			if(!module){
				return false;
			}
		}

		for(i in self._registers){
			if(self._registers === module){
				return true;
			}
		}

		return false;
	}

	/**
	 * Extend a given JOMM method with the function
	 *
	 * @param string   methodName
	 * @param function extension
	 */
	self.extend = function(methodName, extension)
	{
		if(typeof self[methodName] == "function"){
			var parent = self[methodName];
		} else {
			var parent = function(){};
		}

		self[methodName] = function()
		{
			var opt = (self.Option[methodName] == undefined) ?
				{} :
				self.Option[methodName];
			var args = [self, parent, opt].concat(Array.prototype.slice.call(arguments))
			return extension.apply(self, Array.prototype.slice.call(args));
		}
	}

	/**
	 * Inherit two object between us
	 *
	 * @param json oSon
	 * @param json oMother
	 * @param string Type, the Module or Class type
	 * @return JOMM
	 */
	self.inherit = function(oSon, oMother, type)
	{
		for(x in oMother){
			if(oSon[x] == undefined){
				oSon[x] = oMother[x];
			} else {
				if(typeof oSon[x] == "function"){
					oSon['__'+x] = oSon[x];
					oSon[x] = new (function(j)
					{
						var parent = function()
						{
							var args = [oMother[j]].concat(Array.prototype.slice.call(arguments));
							return oMother[j].apply(oSon, args);
						};

						return function(){
							var a = [parent].concat(Array.prototype.slice.call(arguments));
							return oSon['__'+j].apply(oSon, a);
						};
					})(x);
				}
			}
		}

		return self;
	}

	/**
	 * Initialise the registered modules
	 *
	 * @return JOMM
	 */
	self.init = function()
	{
		for(i in self._registers){
			// Inherits modules :
			if(self._registers[i]["parent"] != undefined){
				if(typeof self._registers[i]["parent"] == "string"){
					var str = self._registers[i]["parent"];
					var reg = self._registers[i];
					var parent = self.getModule(str);
					self.inherit(reg, parent);
					self._registers[i] = reg;
				} else if(typeof self._registers[i]["parent"] == "object"){
					var parent = self._registers[i]["parent"];
					self.inherit(self._registers[i], parent);
				} else {
					console.error("JOMM Oups! Bas value for module.parent ("+ 
						typeof self._registers[i]["parent"]+
						", string or object expected).");
				}
			}
			// Initialize modules :
			if(typeof self._registers[i]["init"] == "function"){
				self._registers[i].init();
			}
		}

		return self;
	}

	return self;
})({});