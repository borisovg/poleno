# poleno

A small and fast JSON logger for Node.js applications, inspired by [bunyan](https://github.com/trentm/node-bunyan) and [bole](https://github.com/rvagg/bole).

Features:

- 4 logging levels: debug, info, warn and error
- logging functions accept a maximum of 2 arguments
- logger can be created with a default properties object
- child logger can inherit parent name
- automatic parsing of Error objects
- support for multiple streams

## Usage

Installation:
```
npm install poleno
```

Configuration:
```
var poleno = require('poleno');

poleno.configure({
    streams: [
        { level: 'info', stream: process.stdout }
    ]
});
```

Creating a logger:
```
var log = poleno('FOO');
log.info({ foo: 'foo' }, 'Foo');
// outputs: {"time":"2017-09-27T23:30:57.657Z","hostname":"debian","pid":"15491","name":"FOO","level":"info","msg":"Foo","foo":"foo"}
```

Creating a child logger
```
var childLog = log('BAR');
childLog.info({ bar: 'bar' }, 'Bar');
// outputs: {"time":"2017-09-27T23:30:57.658Z","hostname":"debian","pid":"15491","name":"FOO:BAR","level":"info","msg":"Bar","bar":"bar"}
```

## Viewer

A simple CLI log viewer is included:
```
node app.js | ./node_modules/.bin/poleno
```

## API

### poleno(name, [params])

Creates a new logger using the supplied `name`.

If the optional `params` object is provided then its properties will be included in every log message.

### poleno.configure(options)

The `options` object can include the following properties:

- {bool} fastTime - if set, time will be a number in milliseconds
- {array} streams - array of objects with `level` and `stream` properties

### logger(name, [params])

Creates a child logger.
The `.name` property on the log message JSON will be the parent name and `name` separated by the `:` character.
If the name property is a falsy value then the child logger inherits parent name.

If the optional `params` object is provided then its properties will be included in every log message.

### logger.debug|info|warn|error([params], message)

The `message` string will be assigned to `.msg` property on the log message JSON.

If the optional `params` is an object then its keys will be assigned to the log message JSON.
If `params` is not an object then it will be assigned to a `.data` property on the log message JSON.

If `params` is an `Error` object then it will be assigned to an `.error` property on the log message JSON as an object with `.code`, `.message` and `.stack` properties.
If `params` has a property that is an `Error` object then the property will be logged as an object in the same manner.
