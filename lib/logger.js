/*jshint node:true*/
'use strict';

/**
* @author George Borisov <git@gir.me.uk>
* @copyright George Borisov 2017
* @license LGPL-3.0
*/

var os = require('os');
var util = require('util');
var stringify = require('./stringify.js');

var hostname = os.hostname();

function make_logger (name, params, config) {
    var base = util.format('"hostname":"%s","pid":"%d","name":"%s"', hostname, process.pid, name);
    var get_time, paramsString;

    if (params && Object.keys(params).length) {
        paramsString = JSON.stringify(params);
        base += ',' + paramsString.substr(1, paramsString.length - 2);
    }

    function logger (childName, childParams) {
        var k, newParams;

        if (params) {
            newParams = {};

            for (k in params) {
                /* istanbul ignore else  */
                if (params.hasOwnProperty(k)) {
                    newParams[k] = params[k];
                }
            }
        }

        if (childParams) {
            newParams = newParams || {};

            for (k in childParams) {
                /* istanbul ignore else  */
                if (childParams.hasOwnProperty(k)) {
                    newParams[k] = childParams[k];
                }
            }
        }

        return make_logger(name + ':' + childName, newParams, config);
    }

    if (config.fastTime) {
        get_time = Date.now;

    } else {
        get_time = function () {
            return '"' + new Date().toISOString() + '"';
        };
    }

    config.levels.forEach(function (l) {
        logger[l] = function (a, b) {
            if (!config.streams[l] || !config.streams[l].length) {
                return;

            } else if (a === undefined && b === undefined) {
                return;
            }

            var str = '"time":' + get_time() + ',' + base + ',"level":"' + l + '",' + stringify(a, b);
            var i;

            for (i = 0; i < config.streams[l].length; i += 1) {
                config.streams[l][i].write('{' + str + '}' + '\n');
            }
        };
    });

    return logger;
}

module.exports = make_logger;
