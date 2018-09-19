/*jshint esversion: 6, node:true, mocha:true, varstmt:true*/
'use strict';

const chai = require('chai');
const util = require('util');
const rewire = require('rewire');
const viewer = rewire('../viewer.js');

const expect = chai.expect;

const colours = {
    debug: '\x1b[2m',
    error: '\x1b[31m',
    info: '\x1b[1m',
    trace: '\x1b[2m',
    warn: '\x1b[33m'
};

const levels = ['trace', 'debug', 'info', 'warn', 'error'];

describe('viewer.js', function () {
    const rl = viewer.__get__('rl');

    levels.forEach(function (level) {
        it(`parses ${level} messages`, function (done) {
            const o = {
                time: 'A',
                hostname: 'B',
                name: 'C',
                level,
                msg: 'D',
                foo: 'bar'
            };

            const msg = JSON.stringify(o);
            const expected = `${colours[level]}A B C ${level.toUpperCase()} :: D {\n  "foo": "bar"\n}\x1b[0m`;
            let method;

            if (level === 'debug' || level === 'info' || level === 'trace') {
                method = 'log';
            } else {
                method = 'error';
            }

            chai.util.overwriteMethod(console, method, function (self) {
                return function () {
                    console[method] = self;
                    expect(util.format.apply(undefined, Array.prototype.slice.call(arguments))).to.equal(expected);
                    done();
                };
            });

            rl.emit('line', msg);
        });
    });

    it('logs non-JSON strings to STDERR', function (done) {
        const str = 'foo';

        chai.util.overwriteMethod(console, 'error', function (self) {
            return function () {
                console.error = self;
                expect(arguments.length).to.equal(1);
                expect(arguments[0]).to.equal(str);
                done();
            };
        });

        rl.emit('line', str);
    });

    it('logs invalid JSON strings to STDERR', function (done) {
        const str = '{spanner}';

        chai.util.overwriteMethod(console, 'error', function (self) {
            return function () {
                console.error = self;
                expect(arguments.length).to.equal(1);
                expect(arguments[0]).to.equal(str);
                done();
            };
        });

        rl.emit('line', str);
    });

    it('ignores SIGINT if piped to', function () {
        process.stdin.isTTY = false;
        rewire('../viewer.js');
    });

    after(function () {
        process.stdin.pause();
    });
});
