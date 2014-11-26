var acRE = {};
acRE.carEntry = /CAR_\d+\nSESSION_ID:(\d+)\nMODEL: (\w+) \(\d+\) .*\nDRIVERNAME: (.*)\nGUID:(\d+)/;
acRE.addCar = /Adding car: SID:(\d+) name=(.+) model=(.+) skin=(.+) guid=(\d+)/;
acRE.delCar = /Removing car sid:(\d+) name=(.+) model=([^ ]+) guid=(\d+)/;
acRE.connectCar = /NEW CONNECTION from (.*)\nVERSION (\d+)\nGUID: (\d+)/
acRE.disconnectCar = /Clean exit, driver disconnected:  (.*) []/

var buffer = [];
var bufferLines = '';
var bufferMaxLength = 5;

var resetBuffer = function() {
    buffer = [];
    bufferLines = '';
};

var fillBuffer = function(line) {
    buffer.push(line);
    if (buffer.length > bufferMaxLength ) {
        buffer.shift();
    }
    bufferLines = buffer.join('\n');
};

module.exports = function (server, line, cb) {
    fillBuffer(line);
    if(acRE.carEntry.test(bufferLines)) {
        var matches = bufferLines.match(acRE.carEntry);
        var car = {
            "SESSION_ID": matches[1],
            "MODEL": matches[2],
            "DRIVERNAME": matches[3],
            "GUID": matches[4]
        };
        resetBuffer();
        server.session.drivers[car.GUID] = car;
        server.emit('addcar', car);
    }

    else if(acRE.addCar.test(line)) {
        var matches = line.match(acRE.addCar);
        var car = {
            "SESSION_ID": matches[1],
            "MODEL": matches[3],
            "DRIVERNAME": matches[2],
            "GUID": matches[4]
        };
        resetBuffer();
        server.session.drivers[car.GUID] = car;
        server.emit('addcar', car);
    }

    else if(acRE.connectCar.test(bufferLines)) {
        var matches = bufferLines.match(acRE.connectCar);
        server.session.drivers[matches[3]].connected = true;
        server.emit('connectcar', server.session.drivers[matches[3]]);
    }

    else if(acRE.disconnectCar.test(bufferLines)) {
        var matches = bufferLines.match(acRE.disconnectCar);

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
        var driver = driverByName(server.session, matches[1]);
        server.session.drivers[driver.GUID].connected = false;
        server.emit('disconnectcar', driver);
    }

    else if(acRE.delCar.test(line)) {
        var matches = line.match(acRE.delCar);
        resetBuffer();
        var car = server.session.drivers[matches[4]];
        delete server.session.drivers[car.GUID];
        server.emit('delcar', car);
    }

    cb(null, line);
};