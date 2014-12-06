var acRE = {};
acRE.noCarWithAddress = /^No car with address/;

module.exports = function(server, line, cb) {
    if (acRE.noCarWithAddress.test(line)) {
        cb();
    }
};