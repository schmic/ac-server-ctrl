var acEvents = require('../server-events');

var options = {
    "url": require('config').get('vr.racedb.url'),
    "method": "POST",
    "json": true
};

module.exports = function (server) {
    if(options.url === undefined) {
        return;
    }
    server.on(acEvents.lap.time, function(lap) {
        if(lap.trackConfig) {
            lap.track += '-' + lap.trackConfig;
            delete lap.trackConfig;
        }
        options.body = lap;
        require('request').post(options, function(err, resp, body) {
            if(err) {
                console.error(err);
            }
            console.log('lap.post', lap, '\n', body);
        });
    });
};
