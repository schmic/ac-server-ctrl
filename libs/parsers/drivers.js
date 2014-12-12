var acRE = {};
acRE.carEntry = /CAR_\d+\nSESSION_ID:(\d+)\nMODEL: (\w+) \(\d+\) .*\nDRIVERNAME: (.*)\nGUID:(\d+)/;
acRE.addCar = /Adding car: SID:(\d+) name=(.+) model=(.+) skin=(.+) guid=(\d+)/;
acRE.delCar = /Removing car sid:.* guid=(\d+)/;
acRE.connectCar = /NEW CONNECTION from (.*)\nVERSION (\d+)\nGUID: (\d+)/;
acRE.connectTcpBuffer = /TCP received  \d+ bytes \[(\d+ 0 61 12 0 17 55.*)\]/;
acRE.pickupConnectCar = /NEW PICKUP CONNECTION from.*\nVERSION \d+\nREAD WSTRING: \d+\n(.*)\nREQUESTED CAR: (.*)\*/;
acRE.disconnectCar = /Clean exit, driver disconnected:  (.*) \[/;

var buffer = [];
var bufferLines = '';
var bufferMaxLength = 5;

var lastGUID;

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
            "DRIVERNAME": matches[2],
            "MODEL": matches[3],
            "GUID": matches[5]
        };
        server.session.drivers[car.GUID] = car;
        server.emit('addcar', car);
    }

    else if(acRE.connectCar.test(bufferLines)) {
        var matches = bufferLines.match(acRE.connectCar);
        server.session.drivers[matches[3]].connected = true;
        server.emit('connectcar', server.session.drivers[matches[3]]);
    }

    else if(acRE.connectTcpBuffer.test(line)) {
        var matches = line.match(acRE.connectTcpBuffer);
        var g = matches.pop().split(' ').slice(6, 23).map(function(val) {
            return Number(String.fromCharCode(val));
        }).join('');

        if(g) {
            lastGUID = g;
        }
    }

    else if(acRE.pickupConnectCar.test(bufferLines)) {
        var matches = bufferLines.match(acRE.pickupConnectCar);
        var car = {
            "MODEL": matches.pop(),
            "DRIVERNAME": matches.pop(),
            "GUID": lastGUID
        };
        if(server.session.drivers[car.GUID] === undefined) {
            server.session.drivers[car.GUID] = car;
            server.emit('connectcar', car);
        }
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
        var car = server.session.drivers[matches[1]];
        delete server.session.drivers[car.GUID];
        server.emit('delcar', car);
    }

    cb(null, line);
};