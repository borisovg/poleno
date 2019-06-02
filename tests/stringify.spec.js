'use strict';

const { expect } = require('chai');
const stringify = require('../lib/stringify.js');

describe('lib/stringify.js', function () {
    function test (a, b) {
        const s = stringify(a, b);
        return JSON.parse(`{${s}}`);
    }

    it('stringifies message only log', function () {
        const o = test('Message');
        expect(o.msg).to.equal('Message');
    });

    it('stringifies message with quotes', function () {
        const o = test('Message with "quotes"');
        expect(o.msg).to.equal('Message with "quotes"');
    });

    it('stringifies log with null data', function () {
        const o = test('Message', null);

        expect(o.data).to.equal(null);
        expect(o.msg).to.equal('Message');
    });

    it('strips out undefined values', function () {
        const o = test('Message', { undef: undefined });

        expect(o.msg).to.equal('Message');
        expect(Object.keys(o).indexOf('undef')).to.equal(-1);
    });

    it('stringifies data which is an error object', function () {
        const err = new Error('Test');
        const o = test('Message', err);

        expect(o.msg).to.equal('Message');
        expect(o.error.msg).to.equal(err.msg);
        expect(o.error.stack).to.equal(err.stack);
    });

    it('stringifies nested objects', function () {
        const o = test('Message', { foo: { bar: 'foobar' } });

        expect(o.msg).to.equal('Message');
        expect(o.foo.bar).to.equal('foobar');
    });
});
