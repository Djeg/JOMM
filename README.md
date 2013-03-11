JOMM (Javascript Object and Module Manager)
===========================================

## What ? JOMM !?

JOMM is the acronym for Javascript Object and Module Manager. So, what does it mean ? It's a simple
library that allow you to create modules and classes in an easy way. As you may know, create class
behavior in javascript is something more complicated than other standard object languages. So, i propose
with JOMM a standard way to create classes, modules or interfaces ... well, all the good object's stuff !

### What it looks like ?

JOMM has a very clean syntax to create javascript module or classes. This is
a sample code that display an alert of a given object toString :

```javascript
window.onload = function(){

// create a Foo class :
JOMM.class("Foo", {
	
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
// you can send JOMM, Jquery or other modules in arguments
// to your own module :
JOMM.module("BarModule", function(j){
	
	// instanciate a Foo :
	var FooInstance = j.new("Foo", "Some name");

	// a module return an object :
	return {
		sayHello: function()
		{
			alert(FooInstance.toString());
		}
	};

}, JOMM);

// Now launch your module :
JOMM.launch("BarModule", "sayHello");

}
```

## How install it ?

JOMM installation are easy. Just include the JOMM.min.js file into a corect script tag at the
end of your HTML.

```html
<script type="text/html" src="path/to/JOMM.min.js"></script>
```

## Works with class

Classes are defined like that

```javascript
JOMM.class("MyClass", {
	// some attributes and methods here ...
});
```

### The `self` object (Python stuff ? no !?)

Before started other classes stuffs i have to explain the `self` object. It's send to all
your object method as the **first argument** ! It replaces the standard `this` keyword for 
resolve the asynchronous method calling. An exemple ?

```javascript
JOMM.class("MyClass", {
	
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

var instance = JOMM.new("MyClass");

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
JOMM.class("Foo"{
	init: function(self)
	{
		// constructor stuff here ;)
	}
}
});
```

### Inherit your classes

JOMM proposes a simple way to single inherit classes. An exemple is more efficient than
some words :

```javascript
// Mother
JOMM.class("MotherClass", {
	
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
JOMM.class("DaughterClass", {
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

var mother = JOMM.new("MotherClass");
var daughter = JOMM.new("DaughterClass");

console.log(mother.helloTo("someone")); // print "MotherClass say hello to someone"
console.log(daughter.helloTo("someone")); // print "DaughterClass say hello to someone"
```

So ! Like the `self` statement, `parent` is an argument that will be send as the **second one** for each
method that inherits from a mother class. the parent call directly the mother parent method of course !

#### Okay, but i don't have to precise `self` or `parent` when i called the method ? 

**NO** ! `self` and `parent` statement are called by **JOMM** itself. **You don't have to precise both of them
when you called a method !** (see the python language for more explanation and clarity with `self`).

## Works with Interfaces

Interfaces are a simple way to defined an object comportment. Exemple :

```javascript
JOMM.interface("MyInterface", {
	
	options: "object",
	getFoo: "function",
	getBar: "function",

});

// class that implements interfaces
JOMM.class("Bar", {
	
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
