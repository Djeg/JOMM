var assert = require("assert");
var JOMM = require('../JOMM');

describe("JOMM.Utilities", function(){
	describe("explodeJSON('foo.bar.test')", function(){
		it("Should return {foo: { bar: { test : {} } } }", function(){
			assert.deepEqual({
				foo: {
					bar: {
						test: {}
					}
				}
			}, JOMM.Utilities.explodeJSON("foo.bar.test"), "JOMM.Utilities.explodeJSON works !");
		});
	});

	describe("explodeJSON('foo.bar.test', true)", function(){
		it("Should return {foo: { bar: { test: true} } }", function(){
			assert.deepEqual({
				foo: {
					bar: {
						test: true
					}
				}
			}, JOMM.Utilities.explodeJSON("foo.bar.test", true), "JOMM.Utilities.explodeJSON with concatenation works !");
		});
	});

	describe("jsonGetKey({ foo: { bar: 'the key' } }, 'foo.bar')", function(){
		it("Should return 'the key'", function(){
			assert.equal('the key', JOMM.Utilities.jsonGetKey({
				foo: {
					bar: 'the key'
				}
			}, "foo.bar"));
		});
	});
});