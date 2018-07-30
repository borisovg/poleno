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
        expect(o.msg).to.equal('Message');
    });

    it('stringifies message with quotes', function () {
        var o = test('Message with "quotes"');
        expect(o.msg).to.equal('Message with "quotes"');
    });

    it('stringifies log with null data', function () {
        var o = test('Message', null);

        expect(o.data).to.equal(null);
        expect(o.msg).to.equal('Message');
    });

    it('strips out undefined values', function () {
        var o = test('Message', { undef: undefined });

        expect(o.msg).to.equal('Message');
        expect(Object.keys(o).indexOf('undef')).to.equal(-1);
    });

    it('stringifies data which is an error object', function () {
        var err = new Error('Test');
        var o = test('Message', err);

        expect(o.msg).to.equal('Message');
        expect(o.error.msg).to.equal(err.msg);
        expect(o.error.stack).to.equal(err.stack);
    });

    it('stringifies nested objects', function () {
        var o = test('Message', { foo: { bar: 'foobar' } });

        expect(o.msg).to.equal('Message');
        expect(o.foo.bar).to.equal('foobar');
    });
});
