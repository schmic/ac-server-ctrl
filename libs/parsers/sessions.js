var acRE = {};
acRE.sessionChange = /SENDING session name : (.*)\nSENDING session index : (\d+)\nSENDING session type : (\d+)\nSENDING session time : (\d+)\nSENDING session laps : (\d+)/
acRE.sessionRaceOver = /RACE OVER PACKET, FINAL RANK/;
acRE.track = /^TRACK=(.*)$/;
acRE.dynamicTrackReset = /DynamicTrack: first session, resetting grip/;
acRE.dynamicTrackUpdate = /DynamicTrack: current_grip= ([\d\.]+)  transfer= ([\d\.]+)  sessiongrip= ([\d\.]+)/

var sessionTypes = {
    0: "BOOKING",
    1: "PRACTICE",
    2: "QUALIFY",
    3: "RACE"
};

var buffer = [];
var bufferLines = '';
var bufferMaxLength = 5;

var resetBuffer = function() {
    buffer = [];
    bufferLines = '';
};

var fillBuffer = function(line) {
    buffer.push(line);
    if (buffer.length > bufferMaxLength )
        buffer.shift();
    bufferLines = buffer.join('\n');
};

module.exports = function(server, line, cb) {
    fillBuffer(line);

    if(acRE.dynamicTrackReset.test(line)) {
        if(server.preset.dynamicTrack === undefined) {
            return;
        }
        server.session.dynamictrack = {
            "grip": server.preset.dynamicTrack.SESSION_START
        };
        server.emit('dynamictrack', server.session.dynamictrack);
    }

    if(acRE.dynamicTrackUpdate.test(line)) {
        if(server.preset.dynamicTrack === undefined) {
            return;
        }

        var matches = line.match(acRE.dynamicTrackUpdate);
        server.session.dynamictrack.grip = parseInt(matches[3]) * 100;
        server.emit('dynamictrack', server.session.dynamictrack);
    }

    if(acRE.sessionChange.test(bufferLines)) {
        var matches = bufferLines.match(acRE.sessionChange);

        // first output is broken and repeats anyway
        if(matches[1] === undefined)
            return;

        // no endsession on first session
        if(server.session.name) {
            server.emit('endsession', server.session);
            delete server.session.dontloopatend;
        }

        server.session.name = matches[1];
        server.session.index = parseInt(matches[2]);
        server.session.type = sessionTypes[matches[3]];
        server.session.starttime = new Date().toISOString(),
        server.session.time = parseInt(matches[4]);
        server.session.laps = (matches[5]);
        server.session.laptimes = {};
        server.session.track = server.preset.track;
        server.session.trackConfig = server.preset.trackConfig;
        server.emit('nextsession', server.session);

        resetBuffer();
    }

    if(acRE.sessionRaceOver.test(line)) {
        if(server.session.dontloopatend) {
            return;
        }
        server.session.dontloopatend = true;
        server.emit('endsession', server.session);
        server.emit('raceover', server);
    }

    cb(null, line);
};