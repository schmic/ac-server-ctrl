var path = require('path');
var assert = require('assert');

describe('Parser', function() {
    before(function() {
        this.server = require('../../../libs/server')('testEventCCN11');
        this.stream = require('fs').createReadStream(path.join('test', 'acData', 'inputstreamCCN11'));
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

    describe('inputstreamCCN11', function() {
        it('should be parsed', function(done) {
            this.timeout(10000);
            this.server.proc = {
                "stdout": this.stream,
                "stderr": require('stream').Transform()
            };

            this.server.on('dynamictrack', function(dynamictrack) {
                //console.log('dynamictrack', dynamictrack);
                assert.notEqual(undefined, dynamictrack.grip);
            });

            this.server.on('bestlap', function(o) {
                //console.log('best lap ', o.driver, ':', o.laptime);
                assert.ok(o.laptime > 0);
            });

            this.server.on('addcar', function(car) {
                //console.log('add car', car);
                assert.ok(car.GUID !== undefined);
            });

            this.server.on('connectcar', function(car) {
                //console.log('connect car', car);
                assert.equal(true, car.connected);
            });

            this.server.on('disconnectcar', function(car) {
                //console.log('disconnect car', car);
                assert.notEqual(true, car.connected);
            });

            this.server.on('delcar', function(car) {
                //console.log('del car', car);
                assert.equal(undefined, this.server.session.drivers[car.GUID]);
            });

            this.server.on('nextsession', function(session) {
                console.log('Session', session.name, 'starts');
                assert.notEqual(undefined, session.name);
                assert.notEqual(undefined, session.index);
                assert.notEqual(undefined, session.type);
                assert.notEqual(undefined, session.time);
                assert.notEqual(undefined, session.laps);
                assert.ok(Object.keys(session.laptimes).length === 0);
            });

            this.server.on('endsession', function(session) {
                console.log('Session', session.name, 'ends');
                assert.notEqual(undefined, session.name);
                assert.notEqual(undefined, session.index);
                assert.notEqual(undefined, session.type);
                assert.notEqual(undefined, session.time);
                assert.notEqual(undefined, session.laps);
                if(Object.keys(session.laptimes).length !== 0) {
                    console.log('Best Laptimes:\n', session.laptimes);
                }
            });

            this.server.on('raceover', function(stream, server) {
                console.log('raceover', server.preset.presetName);
                assert.equal('RACE', server.session.type);
                stream.close();
            }.bind(null, this.stream));

            this.stream.on('close', function() {
                setTimeout(function() {
                    done();
                }, 5000);
            });

            this.stream.on('end', function() {
                setTimeout(function() {
                    done();
                }, 5000);
            });

            require('../../../libs/server-parser').connect(this.server);
        });
    });
});