var acRE = {};
acRE.lapTime = /^LAP (.*) (\d+:\d+:\d+)$/;

module.exports = function (server, line, cb) {
    var toSeconds = function (timeStr) {
        var timeParts = timeStr.split(':');
        return parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]) + parseInt(timeParts[2]) / 1000;
    };

    var driverByName = function(session, name) {
        var driver = undefined;
        Object.keys(session.drivers).some(function(k) {
            var nameRE = new RegExp(name, 'i');
            if(session.drivers[k].DRIVERNAME.match(nameRE)) {
                driver = session.drivers[k];
                return true;
            }
        });
        return driver;
    };

    if (acRE.lapTime.test(line)) {
        var matches = line.match(acRE.lapTime);
        var lapTime = toSeconds(matches.pop());
        var driver = driverByName(server.session, matches.pop());

        var lap = {
            "driver": driver.DRIVERNAME,
            "car": driver.MODEL,
            "track": server.session.track,
            "trackConfig": server.session.trackConfig,
            "laptime": lapTime,
            "time": new Date().toISOString(),
            "session": server.session.type
        };

        var bestLap = server.session.laptimes[driver.SID];

        server.emit('lap', lap);

        if (bestLap === undefined || bestLap.laptime > lap.laptime) {
            server.session.laptimes[driver.SID] = lap;
            server.emit('bestlap', lap);
        }
    }

    cb(null, line);
};
