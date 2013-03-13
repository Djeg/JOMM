var assert = require("assert");
var JOMM = require('../jomm');

describe("JOMM.class", function(){

	it("Construct a class with a bar attributes", function(){

		JOMM.class("Foo", {
			init: function(self){
				self.bar = "bar";
			}
		});

		var i = JOMM.new("Foo");

		assert.equal('bar', i.bar);

	});

	it("Extend a class with an other", function(){

		JOMM.class("Mother", {

			init: function(self, name){
				self.name = name;
			},

			hello: function(self)
			{
				return self.name;
			}

		});

		JOMM.class("Daughter", {

			extends: "Mother",

			init: function(self, parent, name, age)
			{
				parent(name);
				self.age = parseInt(age);
			},

			hello: function(self, parent)
			{
				return parent() + " " + self.age + " years old";
			}


		});

		var mother = JOMM.new("Mother", "foo");
		var daughter = JOMM.new("Daughter", "foo", 20);

		assert.equal('foo', mother.hello());

		assert.equal('foo 20 years old', daughter.hello());

	});

});