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
	 * @var Array _registers, contains a list of module ready to be
	 * launched.
	 * @access public
	 */
	self._registers = [];

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
		var i = exploder.shift();
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
		var i = exploder.shift();
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
			self.Module[k] = namespace[k];
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
			self.Class[k] = namespace[k];
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

		console.log(instance);

		if(typeof instance['init'] == 'function') {
			var args = Array.prototype.slice.call(arguments);
			args.shift();
			console.log(args);
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
				console.error("JOMM Oups! You can't register a non-existent module :-( !");
				return self;
			}
		}

		self_registers.push(module);
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
	 * Initialise the registered modules
	 *
	 * @return JOMM
	 */
	self.init = function()
	{
		for(i in self._registers){
			if(typeof self._registers[i]["init"] == "function"){
				self._registers[i].init();
			}
		}

		return self;
	}

	return self;
})({});