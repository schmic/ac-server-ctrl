var getLogfileName = function (workPath) {
    var timeString = (new Date().toISOString()).replace(/[-T:]/g, '').split('.').shift();
    return require('path').join(workPath, timeString + '-server.log');
};

module.exports = function (server, line, cb) {
    // FIXME - might lose some data if server is killed too fast?
    if (server.log === undefined) {
        server.log = require('fs').createWriteStream(getLogfileName(server.workPath), {flags: 'w+', encoding: 'UTF-8'});
    }
    server.log.write(line + "\n");
    cb(null, line);
};