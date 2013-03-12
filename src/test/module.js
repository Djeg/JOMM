var assert = require("assert");
var JOMM = require('../JOMM');

var proto = function()
{
	var self = {};

	self.init = function(options){
		self.options = options;
	}

	return self;
}

JOMM.module("Test1.Foo", proto);

JOMM.module("Test2.Foo", proto);

JOMM.module("Test3.Foo", proto);
JOMM.module("Test3.Bar", proto);

JOMM.module("Test4.Foo", proto);

JOMM.module("Test5.Foo.Foo", proto);

describe("JOMM.module", function(){

	it("Return an object", function(){

		JOMM.init("Test1.Foo");

		assert.deepEqual({}, JOMM.getModule("Test1.Foo").options);

	});

	it("Return an object too", function(){

		JOMM.init("Test2.Foo", {foo: "bar"});

		assert.deepEqual({foo: "bar"}, JOMM.getModule("Test2.Foo").options);

	});

	it("Initialie two modules with run and compare their options", function(){

		JOMM.run({
			"Test3.Foo": {
				foo: true
			},
			"Test3.Bar": {
				bar: true
			}
		});

		assert.deepEqual({foo: true}, JOMM.getModule("Test3.Foo").options);

		assert.deepEqual({bar: true}, JOMM.getModule("Test3.Bar").options);

	});

	it("Warn that a module isn't initialize yet", function(){

		console.log("If you see a JOMM caution! it's normal ! ;)");
		assert.equal(null, JOMM.getModule("Test4.Foo"));

	});

	it("Get a module that get the same name than it's package", function(){

		JOMM.init("Test5.Foo", {foo: true});

		assert.deepEqual({foo: true}, JOMM.getModule("Test5.Foo").options);

	});

});