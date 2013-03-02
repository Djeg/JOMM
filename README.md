JOMM (Javascript Object and Module Manager)
===========================================

## What ? JOMM !?

JOMM is the acronym for Javascript Object and Module Manager. So, what does it mean ? It's a simple
library that allow you to create modules and classes in an easy way.

## What's the point ?

JOMM is a very simple library. Alone, this library does few 
things like create classes, create modules and organize 
them all into some namespaces. That's not very essential. But
if you are like me, if you like very clean and organized code, i think this
libray is for you !

## What it looks like ?

JOMM has a very clean syntax to create javascript module or classes. This is
a sample module :

```javascript
JOMM.createModule("SampleModule", {
	// JOMM controller's (modules and classes) :
	init: function(foo, bar)
	{
		// Like Python, defined attributes here :
		this.foo = foo;
		this.bar = bar;
	},

	// Some methods :
	doSomething: function()
	{
		return this.foo+this.bar;
	}
}
});
```

And this is a very similat sample with a class :

```javascript
JOMM.createClass("SampleClass", {
	// Class constructor :
	init: function(someArgu)
	{
		this.someArgu = someArgu;
	},

	// Some methods :
	doSomething: function()
	{
		return this.someArgu;
	}
}
});
```

As you can see, it's simple JSON that designed modules and/or
classes.

### How can i use it ?

For Classes it's very simple and similar to other languages like
Java, python or PHP. You have to instanciate it !

```javascript
var foo = JOMM.new("SampleClass", "My argument");
console.log(foo.doSometing()); // Print something like "My argument"
```