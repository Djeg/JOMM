var assert = require("assert");
var JOMM = require("../jomm");

JOMM.interface("Test.FooInterface", {

	fooStuff: "function"

});

JOMM.interface("Test.BarInterface", {

	barStuff: "function"

});

JOMM.class("Test.ImplementSingle", {

	implements: ["Test.FooInterface"],

	init: function(self)
	{
		self.name = "single";
	},

	fooStuff: function(self)
	{
		return self.name + "foo";
	}

});

JOMM.class("Test.ImplementMultiple", {

	implements: ["Test.FooInterface", "Test.BarInterface"],

	init: function(self)
	{
		self.name = "multiple";
	},

	fooStuff: function(self)
	{
		return self.name + " foo";
	},

	barStuff: function(self)
	{
		return self.name + " bar";
	}

})


describe("JOMM.interface", function(){

	it("Implement a single interface", function(){

		var i = JOMM.new("Test.ImplementSingle");

		assert.equal(typeof i.fooStuff, "function");

	});

	it("Implement multiple interfaces", function(){

		var i = JOMM.new("Test.ImplementMultiple");

		assert.equal(typeof i.fooStuff, "function");
		assert.equal(typeof i.barStuff, "function");

	});

});