/*jshint node:true, mocha:true*/
'use strict';

var expect = require('chai').expect;
var util = require('util');
var rewire = require('rewire');
var viewer = rewire('../viewer.js');

var colours = {
    debug: '\x1b[2m',
    error: '\x1b[31m',
    info: '\x1b[1m',
    warn: '\x1b[33m'
};

var levels = ['debug', 'info', 'warn', 'error'];

describe('viewer.js', function () {
    var rl = viewer.__get__('rl');

    levels.forEach(function (level) {
        it('parses ' + level + ' messages', function (done) {
            var o = {
                time: 'A',
                hostname: 'B',
                name: 'C',
                level: level,
                message: 'D',
                foo: 'bar'
            };

            var msg = JSON.stringify(o);
            var expected = colours[level] + 'A B C ' + level.toUpperCase() + ' :: D {\n  "foo": "bar"\n}' + '\x1b[0m';

            if (level === 'debug' || level === 'info') {
                viewer.__set__('console', {
                    log: function () {
                        expect(util.format.apply(undefined, Array.prototype.slice.call(arguments))).to.equal(expected);
                        done();
                    }
                });

            } else {
                viewer.__set__('console', {
                    error: function () {
                        expect(util.format.apply(undefined, Array.prototype.slice.call(arguments))).to.equal(expected);
                        done();
                    },
                });
            }

            rl.emit('line', msg);
        });
    });

    it('logs non-JSON strings to STDERR', function (done) {
        var str = 'foo';

        viewer.__set__('console', {
            error: function () {
                expect(arguments.length).to.equal(1);
                expect(arguments[0]).to.equal(str);
                done();
            },
        });

        rl.emit('line', str);
    });

    it('logs invalid JSON strings to STDERR', function (done) {
        var str = '{spanner}';

        viewer.__set__('console', {
            error: function () {
                expect(arguments.length).to.equal(1);
                expect(arguments[0]).to.equal(str);
                done();
            },
        });

        rl.emit('line', str);
    });
});
