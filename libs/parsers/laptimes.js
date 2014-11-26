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

        if (server.session.laptimes[driver.GUID] == undefined) {
            server.session.laptimes[driver.GUID] = {
                "driver": driver.DRIVERNAME,
                "car": driver.MODEL,
                "track": server.session.track,
                "guid": driver.GUID,
                "laptime": lapTime,
                "time": new Date().toISOString(),
                "session": server.session.type
            };
            server.emit('bestlap', server.session.laptimes[driver.GUID])
        }
        else if (server.session.laptimes[driver.GUID].time > lapTime) {
            server.session.laptimes[driver.GUID].time = lapTime;
            server.emit('bestlap', server.session.laptimes[driver.GUID])
        }
    }
    cb(null, line);
};