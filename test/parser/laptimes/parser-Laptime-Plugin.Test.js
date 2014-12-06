var path = require('path');
var assert = require('assert');

describe('Parser', function() {
    before(function() {
        this.server = require('../../../libs/server')('testEventCCN11');
        this.stream = require('fs').createReadStream(path.join('test', 'acData', 'inputstreamLaptimes'));
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

            require('../../../libs/server-parser').connect(this.server);
            require('../../../libs/server-plugins').connect(this.server);

            setTimeout(function() {
                done();
            }, 1000);
        });
    });
});