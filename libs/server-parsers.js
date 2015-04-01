var es = require('event-stream');
var acEvents = require('./server-events');

exports.connect = function (server) {
    var stream = es.merge(server.proc.stdout, server.proc.stderr);
    stream.setMaxListeners(20);
    stream.pipe(es.split());
    stream.pipe(es.map(require("./parsers/file-logger").bind(null, server)));
    stream.pipe(es.map(require("./parsers/dropper").bind(null, server)));
    stream.pipe(es.map(require("./parsers/sessions").bind(null, server)));
    stream.pipe(es.map(require("./parsers/drivers").bind(null, server)));
    stream.pipe(es.map(require("./parsers/laptimes").bind(null, server)));
    stream.pipe(es.map(
        function(server, line, cb) {
            server.emit(acEvents.server.output, line);
            cb(null, line);
        }.bind(null, server)
    ));
};
