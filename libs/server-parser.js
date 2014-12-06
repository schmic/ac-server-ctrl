var es = require('event-stream');
var path = require('path');
var fs = require('fs');

exports.connect = function (server) {
    var stream = es.merge(server.proc.stdout, server.proc.stderr).pipe(es.split());
    stream.setMaxListeners(20);
    stream.pipe(es.map(require("./parsers/file-logger").bind(null, server)));
    stream.pipe(es.map(require("./parsers/dropper").bind(null, server)));
    stream.pipe(es.map(require("./parsers/sessions").bind(null, server)));
    stream.pipe(es.map(require("./parsers/drivers").bind(null, server)));
    stream.pipe(es.map(require("./parsers/laptimes").bind(null, server)));
};
