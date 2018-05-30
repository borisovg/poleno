/*jshint node:true*/
'use strict';

/**
* @author George Borisov <git@gir.me.uk>
* @copyright George Borisov 2017
* @license LGPL-3.0
*/

function stringify (msg, data) {
    var dataStr, err, str, k;

    str = '"msg":"' + msg + '"';

    if (data !== undefined) {
        if (data && typeof data === 'object') {
            if (data.message && data.stack) {
                err = data;
                data = {
                    error: {
                        code: err.code,
                        message: err.message,
                        stack: err.stack
                    }
                };

            } else {
                for (k in data) {
                    /* istanbul ignore else  */
                    if (data.hasOwnProperty(k)) {
                        if (!data[k] || typeof data[k] !== 'object') {
                            continue;

                        } else if (data[k].message && data[k].stack) {
                            err = data[k];
                            data[k] = {
                                code: err.code,
                                message: err.message,
                                stack: err.stack
                            };
                        }
                    }
                }
            }
        }

        dataStr = JSON.stringify(data);

        if (dataStr[0] === '{' && dataStr !== '{}') {
            str += ',' + dataStr.substr(1, dataStr.length - 2);

        } else {
            str += ',"data":' + dataStr;
        }
    }

    return str;
}

module.exports = stringify;
