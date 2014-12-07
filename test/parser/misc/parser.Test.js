var path = require('path');
var assert = require('assert');

describe('Parser', function() {
    before(function() {
        this.server = require('../../../libs/server')('ccn14-training');
        this.stream = require('fs').createReadStream(path.join('test', 'acData', '20141207182530-server.log'));
    });
    // after(function() {});
    // beforeEach(function() {});
    // afterEach(function() {});
    describe('objectCheck', function() {
        it('should not be undefined', function() {
            assert.notEqual(undefined, this.server);
            assert.notEqual(undefined, this.stream);
        });
    });

    describe('inputstreamLaptimes', function() {
        it('should be parsed', function(done) {
            this.timeout(10000);

            this.server.proc = {
                "stdout": this.stream,
                "stderr": require('stream').Transform()
            };

            this.server.on('connectcar', function(server, car) {
                console.log('connectcar', car);
            }.bind(null, this.server));

            require('../../../libs/server-parser').connect(this.server);
            require('../../../libs/server-plugins').connect(this.server);

            setTimeout(function() {
                done();
            }, 1000);
        });
    });
});