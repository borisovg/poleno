/*jshint node:true, mocha:true*/
'use strict';

var expect = require('chai').expect;
var stringify = require('../lib/stringify.js');

describe('lib/stringify.js', function () {
    function test (a, b) {
        var s = stringify(a, b);
        var o;

        try {
            o = JSON.parse('{' + s + '}');
        } catch (e) {
            console.log(s);
            throw e;
        }

        return o;
    }

    it('stringifies message only log', function () {
        var o = test('Message');
        expect(o.message).to.equal('Message');
    });

    it('stringifies log with no data', function () {
        var o = test(undefined, 'Message');
        expect(o.message).to.equal('Message');
    });

    it('stringifies log with null data', function () {
        var o = test(null, 'Message');

        expect(o.data).to.equal(null);
        expect(o.message).to.equal('Message');
    });

    it('strips out undefined values', function () {
        var o = test({ undef: undefined }, 'Message');

        expect(o.message).to.equal('Message');
        expect(Object.keys(o).indexOf('undef')).to.equal(-1);
    });

    it('stringifies data which is an error object', function () {
        var err = new Error('Test');
        var o = test(err, 'Message');

        expect(o.message).to.equal('Message');
        expect(o.error.message).to.equal(err.message);
        expect(o.error.stack).to.equal(err.stack);
    });

    it('stringifies nested objects', function () {
        var o = test({ foo: { bar: 'foobar' } }, 'Message');

        expect(o.message).to.equal('Message');
        expect(o.foo.bar).to.equal('foobar');
    });
});
