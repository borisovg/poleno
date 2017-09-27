/*jshint node:true, mocha:true*/
'use strict';

var expect = require('chai').expect;
var logger = require('../index.js');
var stream = require('stream');

var levels = ['debug', 'info', 'warn', 'error'];

describe('index.js', function () {
    var w = new stream.Writable();

    w._write = function (chunk, encoding, callback) {
        w._cb(chunk.toString());
        callback();
    };

    function send_messages (log, data) {
        var messages = [];

        log = log || logger('TEST');
        data = data || { hello: 'world' };

        w._cb = function (s) {
            var o;

            try {
                o = JSON.parse(s);
            } catch (e) {
                console.log(s);
                throw e;
            }

            messages.push(o);
        };

        levels.forEach(function (l) {
            log[l](data, 'Hello');
        });

        return messages;
    }

    it('configure does nothing of no options are provided', function () {
        logger.configure();
    });

    it('returns a logger instance', function () {
        var log = logger('A');

        levels.forEach(function (l) {
            expect(typeof log[l]).to.equal('function');
        });
    });

    it('returns a child instance', function () {
        var log = logger('B')('CHILD');

        levels.forEach(function (l) {
            expect(typeof log[l]).to.equal('function');
        });
    });

    it('logger does nothing if there are no streams are defined', function () {
        var log = logger('C');

        levels.forEach(function (l) {
            log[l]({ hello: 'world' }, 'Test Message');
        });
    });

    it('error gets error messages', function () {
        logger.configure({
            streams: [
                { level: 'error', stream: w }
            ]
        });

        var messages = send_messages();

        expect(messages.length).to.equal(1);
        expect(messages[0].hello).to.equal('world');
        expect(messages[0].message).to.equal('Hello');
    });

    it('warn gets warn and error messages', function () {
        logger.configure({
            streams: [
                { level: 'warn', stream: w }
            ]
        });

        var messages = send_messages();

        expect(messages.length).to.equal(2);

        messages.forEach(function (m) {
            expect(m.hello).to.equal('world');
            expect(m.message).to.equal('Hello');
        });
    });

    it('info gets info, warn and error messages', function () {
        logger.configure({
            streams: [
                { level: 'info', stream: w }
            ]
        });

        var messages = send_messages();

        expect(messages.length).to.equal(3);

        messages.forEach(function (m) {
            expect(m.hello).to.equal('world');
            expect(m.message).to.equal('Hello');
        });
    });

    it('debug gets debug, info, warn and error messages', function () {
        logger.configure({
            streams: [
                { level: 'debug', stream: w }
            ]
        });

        var messages = send_messages();

        expect(messages.length).to.equal(4);

        messages.forEach(function (m) {
            expect(m.hello).to.equal('world');
            expect(m.message).to.equal('Hello');
        });
    });

    it('writes logs to multiple streams', function () {
        logger.configure({
            streams: [
                { level: 'error', stream: w },
                { level: 'warn', stream: w }
            ]
        });

        var messages = send_messages();

        expect(messages.length).to.equal(3);

        messages.forEach(function (m) {
            expect(m.hello).to.equal('world');
            expect(m.message).to.equal('Hello');
        });
    });

    it('logs time as string by default', function () {
        logger.configure({
            streams: [
                { level: 'error', stream: w },
            ]
        });

        var messages = send_messages();

        expect(typeof messages[0].time).to.equal('string');
    });

    it('logs time as a number if fastTime is set', function () {
        logger.configure({
            fastTime: true
        });

        var messages = send_messages();

        expect(typeof messages[0].time).to.equal('number');
    });

    it('sets correct logger name', function () {
        var log = logger('FOO');
        var messages = send_messages(log);

        expect(messages[0].name).to.equal('FOO');
    });

    it('sets correct child logger name', function () {
        var log = logger('FOO')('BAR')('BAZ');
        var messages = send_messages(log);

        expect(messages[0].name).to.equal('FOO:BAR:BAZ');
    });

    it('sets logger params', function () {
        var log = logger('FOO', { foo: 'foo' });
        var messages = send_messages(log);

        expect(messages[0].foo).to.equal('foo');
    });

    it('sets child logger params', function () {
        var log = logger('FOO')('BAR', { bar: 'bar' });
        var messages = send_messages(log);

        expect(messages[0].bar).to.equal('bar');
    });

    it('inherits parent logger params', function () {
        var log = logger('FOO', { foo: 'foo' })('BAR', { bar: 'bar' });
        var messages = send_messages(log);

        expect(messages[0].foo).to.equal('foo');
        expect(messages[0].bar).to.equal('bar');
    });

    it('logs message alone', function () {
        var messages = [];

        w._cb = function (s) {
            messages.push(JSON.parse(s));
        };

        logger('TEST').error('Message');
        logger('TEST').error(undefined, 'Message');

        messages.forEach(function (m) {
            expect(m.message).to.equal('Message');
        });
    });

    it('does nothing if no arguments provided', function () {
        var messages = [];

        w._cb = function (s) {
            messages.push(JSON.parse(s));
        };

        logger('TEST').error();

        expect(messages.length).to.equal(0);
    });

    it('assigns to data key if first argument is not an object', function () {
        var messages = [];

        w._cb = function (s) {
            messages.push(JSON.parse(s));
        };

        logger('TEST').error(['foo'], 'Message');
        logger('TEST').error('foo', 'Message');
        logger('TEST').error(null, 'Message');
        logger('TEST').error(false, 'Message');

        expect(messages[0].data[0]).to.equal('foo');
        expect(messages[1].data).to.equal('foo');
        expect(messages[2].data).to.equal(null);
        expect(messages[3].data).to.equal(false);
    });

    it('logs error objects', function () {
        var messages = [];
        var err = new Error('Test Error');

        w._cb = function (s) {
            messages.push(JSON.parse(s));
        };

        logger('TEST').error({ error: err }, 'Message');
        logger('TEST').error(err, 'Message');

        messages.forEach(function (m) {
            expect(m.error.message).to.equal(err.message);
            expect(m.error.stack).to.equal(err.stack);
        });
    });
});
