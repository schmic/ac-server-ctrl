var request = require('request');
var config = require('config');

var options = {
    "url": config.VR.RaceDB.URL,
    "method": "POST",
    "json": true
};

module.exports = function (server) {
    server.on('bestlap', function(lap) {
        options.body = lap;
        console.log('plugin.bestlap', options);

        request.post(options, function(err, resp, body) {
            if(err) console.error(err);
            console.log('request.post', err, resp, body);
        });
    });
};
