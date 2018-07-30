/*jshint node:true*/
'use strict';

/**
* @author George Borisov <git@gir.me.uk>
* @copyright George Borisov 2017
* @license LGPL-3.0
*/

var logger = require('./lib/logger.js');

var config = {
    fastTime: false,
    flipArgs: false,
    levels: ['trace', 'debug', 'info', 'warn', 'error'],
    streams: Object.create(null)
};

function poleno (name, params) {
    return logger(name, params, config);
}

function add_stream (stream, level) {
    var i, l;

    for (i = config.levels.indexOf(level); i < config.levels.length; i += 1) {
        l = config.levels[i];
        config.streams[l] = config.streams[l] || [];
        config.streams[l].push(stream);
    }
}

poleno.configure = function (opts) {
    var i, l;

    if (!opts) {
        return;
    }

    if (opts.fastTime !== undefined) {
        config.fastTime = opts.fastTime;
    }

    if (opts.flipArgs !== undefined) {
        config.flipArgs = opts.flipArgs;
    }

    if (opts.streams) {
        // jshint -W089
        for (l in config.streams) {
            config.streams[l] = undefined;
        }

        for (i = 0; i < opts.streams.length; i += 1) {
            add_stream(opts.streams[i].stream, opts.streams[i].level);
        }
    }
};

module.exports = poleno;
