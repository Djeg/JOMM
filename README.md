jomm (Javascript Object and Module Manager)
===========================================

[![Build Status](https://travis-ci.org/davidjegat/JOMM.png)](https://travis-ci.org/davidjegat/JOMM)

## What ? jomm !?

jomm is the acronym for Javascript Object and Module Manager. So, what does it mean ? It's a simple
library that allow you to create modules and classes in an easy way. As you may know, create class
behavior in javascript is something more complicated than other standard object languages. So, i propose
with jomm a standard way to create classes, modules or interfaces ... well, all the good object's stuff !

### What it looks like ?

jomm has a very clean syntax to create javascript module or classes. This is
a sample code that display an alert of a given object toString :

```javascript
// create a Foo class :
jomm.class("Foo", {
	
	// Constructor for any classes. It take "self" in
	// first argument. Like python self is the object instance
	// itself.
	init: function(self, bar)
	{
		self.bar = bar;
	},

	// Simple toString, return some hello stuff
	toString: function(self)
	{
		return "Hello i'm "+self.bar; 
	}

});

// create a module for display some Foo stuff
// you can send jomm, Jquery or other modules in arguments
// to your own module :
jomm.module("BarModule", function(j){
	
	// instanciate a Foo :
	var FooInstance = j.new("Foo", "Some name");

	// a module return an object :
	return {
		sayHello: function()
		{
			alert(FooInstance.toString());
		},
		init: function(options)
		{
			this.sayHello();
		}
	};

}, jomm);

// Now launch your module :
jomm.init("BarModule");
```

## How install it ?

jomm is available for web browser and / or nodejs.

## client side

jomm installation are easy. Just include the jomm.min.js file into a corect script tag at the
end of your HTML.

```html
<script type="text/html" src="path/to/jomm.min.js"></script>
```

## node js and npm

you can install jomm for nodejs with the following npm package `npm install jomm`

## Works with class

Classes are defined like that

```javascript
jomm.class("MyClass", {
	// some attributes and methods here ...
});
```

### Create an instance

jomm is a **manager**. It means that all classes or modules are store into jomm it self !
This is how instanciate a given class :

```javascript
var foo = jomm.new("MyClass", "parameter 1", "parameter 2");
```

### The `self` object (Python stuff ? no !?)

Before started other classes stuffs i have to explain the `self` object. It's send to all
your object method as the **first argument** ! It replaces the standard `this` keyword for 
resolve the asynchronous method calling. An exemple ?

```javascript
jomm.class("MyClass", {
	
	init: function(self)
	{
		self.foo = "foo";
		self.bar = "bar";
	},

	hello: function(self)
	{
		// Here we use the this statement :
		console.log("Hello i'm "+this.foo+" "+this.bar);
	}

});

var instance = jomm.new("MyClass");

instance.hello(); // print "Hello i'm foo bar"

// exemple of callback with jquery slideDown :
$(".element").slideDown('slow', instance.hello); // print "Hello i'm undefined undefined" !!
```

In the first exemple `instance.hello();`, `this` statement is the same object as `self`. But in the
second case `.slideDown('slow', instance.hello);`, Due to the callback, `this` is the **jQuery element**
but `self` still your object !! Magic stuff isn't it ?

### constructor

The constructor is call `init`.

```javascript
jomm.class("Foo"{
	init: function(self)
	{
		// constructor stuff here ;)
	}
}
});
```

### Inherit your classes

jomm proposes a simple way to single inherit classes. An exemple is more efficient than
some words :

```javascript
// Mother
jomm.class("MotherClass", {
	
	init: function(self)
	{
		self.name = "MotherClass";
	},

	helloTo: function(self, name)
	{
		return self.name+" say hello to "+name;
	}

});

// The daughter
jomm.class("DaughterClass", {
	// precise the inheritance :
	extends: "MotherClass",

	init: function(self, parent)
	{
		// parent is the MotherClass constructor
		self.name = "DaughterClass";
	},

	helloTo: function(self, parent, name)
	{
		// Call the parent method :
		return parent(name);
	}

});

var mother = jomm.new("MotherClass");
var daughter = jomm.new("DaughterClass");

console.log(mother.helloTo("someone")); // print "MotherClass say hello to someone"
console.log(daughter.helloTo("someone")); // print "DaughterClass say hello to someone"
```

So ! Like the `self` statement, `parent` is an argument that will be send as the **second one** for each
method that inherits from a mother class. the parent call directly the mother parent method of course !

#### Okay, but i don't have to precise `self` or `parent` when i called the method ? 

**NO** ! `self` and `parent` statement are called by **jomm** itself. **You don't have to precise both of them
when you called a method !** (see the python language for more explanation and clarity with `self`).

## Works with Interfaces

Interfaces are a simple way to defined an object comportment. Exemple :

```javascript
jomm.interface("MyInterface", {
	
	options: "object",
	getFoo: "function",
	getBar: "function",

});

// class that implements interfaces
jomm.class("Bar", {
	
	implements: ['MyInterface'],

	//here implement options, getFoo and getBar ...

});
```

Interfaces are :
*	simple json object with the method/attribute name (**key**)
*	a string that defined the type (**value**). 

So, here :

*	`options` must be an object (json, array, or new something ...)
*	`getFoo` must be a function that return all of you want
*	`getBar` must ba function too.

You can have as many implementation of you want !

### List of accepted types :

*	`"number"`
*	`"string"`
*	`"boolean"`
*	`"object"`
*	`"undefined"`
*	`"*"`

## Works with module

A module is a special pattern that deal with javascript. It's essential to 
use this pattern in your application. This is the structure of a module :

```javascript
// Basic module
jomm.module("MyModule", function($, _) // A module can take other modules
{
	// Private stuff here :
	var some = "foo";


	return {	// It must return a JSON (public stuff)
		init: function(options)	// Init received a json with all the module options
		{
			// do some stuff
		}
	};
}, jQuery, underscore);

// Module with more clear syntax
jomm.module("GoodSyntax", function()
{
	var self = {};

	var privateAtribute = "foo";

	var privateMethod = function()
	{
		// private stuff
	}

	self.publicAttribute = "bar";

	self.publicMethod = function()
	{
		// call a private attribute or method :
		privateAttribute;
		privateMethod(); // Don't use the self keyword for private
	}

	// finaly return the public json self
	return self;
});
```

Module are a standard way to defined javascript component. A jomm module is a simple function
that can take any arguments of your choice and must return a Json for defined it's object structure.
Globaly, a module represent the perfect implementation for **facade** or **command** pattern. It
simplify a more complex structure with some command.

### Initialize and configure your modules

A jomm module can be initialize just once ! It's a sort of **singleton** that represent a started point
of a given application task. Let's see how initialize a module :

```javascript
jomm.init("MyModule", { // here the module option
	foo: true,
	bar: true,
	...
})
```

this short code launch the `init` method with the given options but not return it !

### How to get an initialize module ?

It's very simple, if you have initialize `"MyModule"` then can get it like that :

```javascript
var myModule = jomm.getModule("MyModule"); // No argument is need
```

If `"MyModule"` isn't initialize, then the command `getModule` will return `null` and will send 
a console warning.

### Deal with your application

So, you have seen the classes, interfaces and modules components of jomm. Now, this
command it's more simple and i think : powerfull.

```javascript
// Let's see how run an application
jomm.run({
	"FirstModule": {
		// some options,
	},
	"SecondModule": {
		// some options,
	},
	...
});
```

With jomm, application become a simple JSON that deal with module.

## Packages

The last think i've to show you it's package.

```javascript
jomm.class("Package.MyClass", {
	// some code ...
})
```

So, it's really simple. But packages can get a started point (called it a **facade** or a **command** depending
of the packages complexity). This is an exemple :

```javascript
jomm.module("Package.Package", function(){
	// some module code ...
});

// and now you can abstract the package complexity with this
// simple module. First, initialize it with "run" or "init" :
jomm.init("Package", { // you don't need to precise Package(.Package), it's logic for jomm ;) 
	// some options
});

// Get the module and deal with it for iteract with the entire package
var theFacade = jomm.getModule("Package"); // once more, don't precise Package(.Package) ;) !
```

## Conclusion

Thanks to read this short manual and i hope that jomm will be useful for you.