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

ServerCtrl.prototype.start = function(presetName, cb) {
    if (this.status(presetName) === 1) {
        throw new Error('Preset ' + presetName + ' is already active');
    }

    try {
        var server = require('./server')(presetName);
    }
    catch(e) {
        switch(e.code) {
            case 'ENOENT':
                console.error('Preset', presetName, 'does not exist');
                break;
            default:
                console.error(e);
        }
        return;
    }

    spawnProcess(server);
    writePidFile(server);
    connectParsers(server);
    connectPlugins(server);

    this.servers[presetName] = server;
    console.log('Started server', server.preset.serverName, 'PID:', server.proc.pid);
    this.emit('serverstart', server);

    if(typeof cb === 'function') {
        cb(presetName);
    }
};

ServerCtrl.prototype.stop = function(presetName, cb) {
    var server = this.servers[presetName];
    server.proc.kill();
    delete this.servers[presetName];
    console.log('Stopped server', server.preset.serverName, 'PID:', server.proc.pid);
    this.emit('serverstop', server);

    if(typeof cb === 'function') {
        cb(presetName);
    }
};

ServerCtrl.prototype.status = function(presetName, cb) {
    var server = this.servers[presetName];
    var status;

    if(server === undefined) {
        status = 0;
    }
    else if (fs.existsSync(server.pidFile) === false) {
        status = 0;
    }
    else if(server.proc === undefined) {
        status = 0;
    }
    else {
        try {
            process.kill(server.proc.pid, 0);
            status = 1;
        }
        catch (e) {
            handleExit(server);
            status = -1;
        }
    }

    if(typeof cb === 'function') {
        cb(presetName, status);
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
