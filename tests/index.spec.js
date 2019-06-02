'use strict';

const { expect } = require('chai');
const logger = require('../index.js');
const stream = require('stream');

const levels = ['trace', 'debug', 'info', 'warn', 'error'];

describe('index.js', function () {
    const w = new stream.Writable();

    w._write = function (chunk, encoding, callback) {
        w._cb(chunk.toString());
        callback();
    };

    function send_messages (log, data) {
        const messages = [];
        log = log || logger('TEST');

        if (data === null) {
            data = undefined;
        } else {
            data = data || { hello: 'world' };
        }

        w._cb = function (s) {
            messages.push(JSON.parse(s));
        };

        levels.forEach(function (l) {
            log[l]('Hello', data);
        });

        return messages;
    }

    context('general tests', function () {
        it('configure does nothing of no options are provided', function () {
            logger.configure();
        });

        it('returns a logger instance', function () {
            const log = logger('A');

            levels.forEach(function (l) {
                expect(typeof log[l]).to.equal('function');
            });
        });

        it('returns a child instance', function () {
            const log = logger('B')('CHILD');

            levels.forEach(function (l) {
                expect(typeof log[l]).to.equal('function');
            });
        });
    });

    context('default argument order', function () {
        it('logger does nothing if there are no streams are defined', function () {
            const messages = send_messages();
            expect(messages.length).to.equal(0);
        });

        it('does nothing if no arguments provided', function () {
            logger.configure({
                streams: [
                    { level: 'error', stream: w }
                ]
            });

            w._cb = function () {
                throw new Error('this should not happen');
            };

            logger('TEST').error();
        });

        it('error gets error messages', function () {
            const messages = send_messages();

            expect(messages.length).to.equal(1);
            expect(messages[0].hello).to.equal('world');
            expect(messages[0].msg).to.equal('Hello');
        });

        it('warn gets warn and error messages', function () {
            logger.configure({
                streams: [
                    { level: 'warn', stream: w }
                ]
            });

            const messages = send_messages();

            expect(messages.length).to.equal(2);

            messages.forEach(function (m) {
                expect(m.hello).to.equal('world');
                expect(m.msg).to.equal('Hello');
            });
        });

        it('info gets info, warn and error messages', function () {
            logger.configure({
                streams: [
                    { level: 'info', stream: w }
                ]
            });

            const messages = send_messages();

            expect(messages.length).to.equal(3);

            messages.forEach(function (m) {
                expect(m.hello).to.equal('world');
                expect(m.msg).to.equal('Hello');
            });
        });

        it('debug gets debug, info, warn and error messages', function () {
            logger.configure({
                streams: [
                    { level: 'debug', stream: w }
                ]
            });

            const messages = send_messages();

            expect(messages.length).to.equal(4);

            messages.forEach(function (m) {
                expect(m.hello).to.equal('world');
                expect(m.msg).to.equal('Hello');
            });
        });

        it('trace gets trace, debug, info, warn and error messages', function () {
            logger.configure({
                streams: [
                    { level: 'trace', stream: w }
                ]
            });

            const messages = send_messages();

            expect(messages.length).to.equal(5);

            messages.forEach(function (m) {
                expect(m.hello).to.equal('world');
                expect(m.msg).to.equal('Hello');
            });
        });

        it('logs time as string by default', function () {
            logger.configure({
                streams: [
                    { level: 'error', stream: w },
                ]
            });

            const messages = send_messages();

            expect(typeof messages[0].time).to.equal('string');
        });

        it('logs time as a number if fastTime is set', function () {
            logger.configure({
                fastTime: true
            });

            const messages = send_messages();

            expect(typeof messages[0].time).to.equal('number');
        });

        it('sets correct logger name', function () {
            const log = logger('FOO');
            const messages = send_messages(log);

            expect(messages[0].name).to.equal('FOO');
        });

        it('sets correct child logger name', function () {
            const log = logger('FOO')('BAR')('BAZ');
            const messages = send_messages(log);

            expect(messages[0].name).to.equal('FOO:BAR:BAZ');
        });

        it('sets correct child logger name when name is not provided', function () {
            const log = logger('FOO')('BAR')('');
            const messages = send_messages(log);

            expect(messages[0].name).to.equal('FOO:BAR');
        });

        it('sets logger params', function () {
            const log = logger('FOO', { foo: 'foo' });
            const messages = send_messages(log);

            expect(messages[0].foo).to.equal('foo');
        });

        it('is not bothered by logger params with undefined values', function () {
            const log = logger('FOO', { bar: undefined });
            const messages = send_messages(log);

            expect(messages[0].name).to.equal('FOO');
        });

        it('sets child logger params', function () {
            const log = logger('FOO')('BAR', { bar: 'bar' });
            const messages = send_messages(log);

            expect(messages[0].bar).to.equal('bar');
        });

        it('inherits parent logger params', function () {
            const log = logger('FOO', { foo: 'foo' })('BAR', { bar: 'bar' });
            const messages = send_messages(log);

            expect(messages[0].foo).to.equal('foo');
            expect(messages[0].bar).to.equal('bar');
        });

        it('logs message alone', function () {
            const messages = [];

            w._cb = function (s) {
                messages.push(JSON.parse(s));
            };

            logger('TEST').error('Message');
            logger('TEST').error('Message');

            messages.forEach(function (m) {
                expect(m.msg).to.equal('Message');
            });
        });

        it('logs error objects', function () {
            const messages = [];
            const error = new Error('Test Error');

            w._cb = function (s) {
                messages.push(JSON.parse(s));
            };

            logger('TEST').error('Message', { error });
            logger('TEST').error('Message', error);

            messages.forEach(function (m) {
                expect(m.error.message).to.equal(error.message);
                expect(m.error.stack).to.equal(error.stack);
            });
        });
    });

    context('with flipArgs option enabled', function () {
        it('logger does nothing if there are no streams are defined', function () {
            logger.configure({
                flipArgs: true,
                streams: []
            });

            w._cb = function () {
                throw new Error('this should not happen');
            };

            logger('TEST').info();
        });

        it('does nothing if no arguments provided', function () {
            logger.configure({
                streams: [
                    { level: 'trace', stream: w }
                ]
            });

            logger('TEST').info();

        });

        it('logs messages with no data', function () {
            const messages = [];

            w._cb = function (s) {
                messages.push(JSON.parse(s));
            };

            logger('TEST').info('Message');
            logger('TEST').info(undefined, 'Message');

            expect(messages.length).to.equal(2);

            messages.forEach(function (m) {
                expect(m.data).to.equal(undefined);
                expect(m.msg).to.equal('Message');
            });
        });

        it('logs message with data', function () {
            const messages = [];

            w._cb = function (s) {
                messages.push(JSON.parse(s));
            };

            logger('TEST').info('Data', 'Message');

            messages.forEach(function (m) {
                expect(m.data).to.equal('Data');
                expect(m.msg).to.equal('Message');
            });
        });
    });
});
