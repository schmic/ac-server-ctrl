var options = {
    "url": require('config').VR.RaceDB.URL,
    "method": "POST",
    "json": true
};

module.exports = function (server) {
    if(options.url === undefined) {
        return;
    }

    server.on('bestlap', function(lap) {
        options.body = lap;
        require('request').post(options, function(err, resp, body) {
            if(err) {
                console.error(err);
            }
            console.log('bestlap.post', lap, '\n', body);
        });
    });
};
