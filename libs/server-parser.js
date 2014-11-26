var es = require('event-stream');
var path = require('path');
var fs = require('fs');

module.exports = {
    connect: function (server) {
        var stream = es.merge(server.proc.stdout, server.proc.stderr).pipe(es.split());
        stream.setMaxListeners(50);
        fs.readdirSync(path.join(__dirname, "parsers")).forEach(function (file) {
            stream.pipe(es.map(require("./parsers/" + file).bind(null, server)));
        });
    }
};
