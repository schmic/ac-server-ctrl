var fs = require('fs');
var path = require('path');
var util = require('util');
var events = require('events');
var env = require('./env');

var ServerCtrl = function () {
    events.EventEmitter.call(this);
};

util.inherits(ServerCtrl, events.EventEmitter);

ServerCtrl.prototype.servers = {};
ServerCtrl.prototype.env = env;

ServerCtrl.prototype.start = function(presetName) {
    if (this.status(presetName) === 1) {
        throw new Error('Preset ' + presetName + ' is already active');
    }

    var server = require('./server')(presetName);

    spawnProcess(server);
    writePidFile(server);
    connectParsers(server);
    connectPlugins(server);

    this.servers[presetName] = server;
    console.log('Started server', server.name, 'PID:', server.proc.pid);
    this.emit('serverstart', server);
    return true;
};

ServerCtrl.prototype.stop = function(presetName) {
    var server = this.servers[presetName];
    server.proc.kill();
    delete this.servers[presetName];
    console.log('Stopped server', server.name, 'PID:', server.proc.pid);
    this.emit('serverstop', server);
    return true;
};

ServerCtrl.prototype.status = function(presetName) {
    var server = this.servers[presetName];

    if(server === undefined) {
        return 0;
    }
    if (fs.existsSync(server.pidFile) === false) {
        return 0;
    }
    if(server.proc === undefined) {
        return 0;
    }
    try {
        process.kill(server.proc.pid, 0);
        return 1;
    }
    catch (e) {
        handleExit(server);
        return -1;
    }
};

module.exports = exports = new ServerCtrl();

var handleExit = function(server) {
    fs.unlink(server.pidFile, function(err) {
        if(err) return console.error(err);
        console.log('Server process exit, removing pid file: ', server.pidFile);
    });
};

var connectParsers = function(server) {
    require('./server-parser').connect(server);
};

var connectPlugins = function(server) {
    require('./server-plugins').connect(server);
};

var writePidFile = function(server) {
    fs.writeFile(server.pidFile, server.proc.pid, function(err) {
        if(err) return console.error(err);
    });
};

var spawnProcess = function(server) {
    var exe = env.getServerExecutable();
    var args = [
        '-c', path.join(server.workPath, 'server_cfg.ini'),
        '-e', path.join(server.workPath, 'entry_list.ini')
    ];
    var opts = {
        cwd: env.getACPath()
    };

    var proc = require('child_process').spawn(exe, args, opts);
    proc.on('exit', handleExit.bind(null, server));
    proc.on('SIGINT', handleExit.bind(null, server));
    proc.on('uncaughtException', handleExit.bind(null, server));
    server.proc = proc;
};


