'use strict';

/**
* @author George Borisov <git@gir.me.uk>
* @copyright George Borisov 2017
* @license LGPL-3.0
*/

function stringify (msg, data) {
    var dataStr, err, k;

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

        data.msg = msg;

    } else {
        data = { data: data, msg: msg };
    }

    dataStr = JSON.stringify(data);
    return dataStr.substr(1, dataStr.length - 2);
}

module.exports = stringify;
