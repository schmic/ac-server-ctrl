var acRE = {};

//acRE.carEntry = /CAR_\d+\nSESSION_ID:(\d+)\nMODEL: (\w+) \(\d+\) .*\nDRIVERNAME: (.*)\nGUID:(\d+)/;
//acRE.addCar = /Adding car: SID:(\d+) name=(.+) model=(.+) skin=(.+) guid=(\d+)/;
//acRE.delCar = /Removing car sid:.* guid=(\d+)/;

// Sending first leaderboard to car: bmw_m3_e92_s1 (0) [Michael Scherer []]
acRE.connectCar = /Sending first leaderboard to car: (.+) \((\d+)\) \[(.+) \[\]\]/;

// Clean exit, driver disconnected:  Gnomi Stra []
// ResetCarResults, index: 12
acRE.disconnectCar = /Clean exit, driver disconnected: .*\nResetCarResults, index: (\d+)/;

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
    //if(acRE.carEntry.test(bufferLines)) {
    //    var matches = bufferLines.match(acRE.carEntry);
    //    var car = {
    //        "SID": matches[1],
    //        "DRIVERNAME": matches[3],
    //        "MODEL": matches[2]
    //    };
    //    resetBuffer();
    //    server.session.drivers[car.SID] = car;
    //    server.emit('addcar', car);
    //}
    //
    //else if(acRE.addCar.test(line)) {
    //    var matches = line.match(acRE.addCar);
    //    var car = {
    //        "SID": matches[1],
    //        "DRIVERNAME": matches[2],
    //        "MODEL": matches[3]
    //    };
    //    server.session.drivers[car.SID] = car;
    //    server.emit('addcar', car);
    //}
    //else if(acRE.delCar.test(line)) {
    //    var matches = line.match(acRE.delCar);
    //    resetBuffer();
    //    var car = server.session.drivers[matches[1]];
    //    delete server.session.drivers[car.SID];
    //    server.emit('delcar', car);
    //}


    if(acRE.connectCar.test(line)) {
        var matches = line.match(acRE.connectCar);
        var car = {
            "SID": matches[2],
            "DRIVERNAME": matches[3],
            "MODEL": matches[1]
        };
        server.session.drivers[car.SID] = car;
        server.emit('connectcar', car);
    }

    else if(acRE.disconnectCar.test(line)) {
        var matches = bufferLines.match(acRE.disconnectCar);

        var car = server.session.drivers[matches[1]];
        server.emit('disconnectcar', car);

        delete server.session.drivers[matches[1]];
        resetBuffer();
    }

    cb(null, line);
};
