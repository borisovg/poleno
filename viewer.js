#!/usr/bin/env node
/*jshint node:true*/
'use strict';

/**
* @author George Borisov <git@gir.me.uk>
* @copyright George Borisov 2017
* @license LGPL-3.0
*/

var readline = require('readline');
var rl = readline.createInterface({ input: process.stdin });

var colours = {
    debug: '\x1b[2m',
    error: '\x1b[31m',
    info: '\x1b[1m',
    trace: '\x1b[2m',
    warn: '\x1b[33m'
};

var usedKeys = [
    'hostname',
    'level',
    'name',
    'msg',
    'pid',
    'time'
];

function filter (k) {
    return (usedKeys.indexOf(k) === -1);
}

function print (o, dest) {
    var data = {};

    Object.keys(o).filter(filter).forEach(function (k) {
        data[k] = o[k];
    });

    console[dest](colours[o.level] + o.time, o.hostname, o.name, o.level.toUpperCase(), '::', o.msg, JSON.stringify(data, undefined, 2) + '\x1b[0m');
}

rl.on('line', function (line) {
    if (line[0] === '{') {
        try {
            var o = JSON.parse(line);

            if (o.level === 'debug' || o.level === 'info' || o.level === 'trace') {
                print(o, 'log');
            } else {
                print(o, 'error');
            }

        } catch (e) {
            console.error(line);
        }

    } else {
        console.error(line);
    }
});

// ignore SIGINT when piped to
if (!process.stdin.isTTY) {
    process.on('SIGINT', /*istanbul ignore next*/ function () {});
}
