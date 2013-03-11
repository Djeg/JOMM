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