var path = require('path');
var fs = require('fs');

exports.connect = function (server) {
    fs.readdirSync(path.join(__dirname, "plugins")).forEach(function (file) {
        require(path.join(__dirname, "plugins", file))(server);
    });
};
