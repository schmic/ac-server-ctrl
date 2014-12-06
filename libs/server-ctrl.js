var fs = require('fs');
var path = require('path');
var env = require('./env');

var servers = {};

var handleExit = function(server) {
    fs.unlink(server.pidFile, function(err) {
        if(err) return console.error(err);
        console.log('Server process exit, removing pid file: ', server.pidFile);
    });
};

var writePidFile = function(server) {
    fs.writeFile(server.pidFile, server.proc.pid, function(err) {
        if(err) return console.error(err);
    });
};

var handleOutput = function(server) {
    require('./server-parser').connect(server);
};

var spawnProcess = function(server) {
    var args = [
        '-c', path.join(server.workPath, 'server_cfg.ini'),
        '-e', path.join(server.workPath, 'entry_list.ini')
    ];

    var proc = require('child_process').spawn(env.getServerExecutable(), args, { cwd: env.getACPath() });
    proc.on('exit', handleExit.bind(null, server));
    proc.on('SIGINT', handleExit.bind(null, server));
    proc.on('uncaughtException', handleExit.bind(null, server));
    server.proc = proc;
};

var start = function(presetName) {
    var server = require('./server')(presetName);

    if (isRunning(server)) {
        throw new Error('Preset ' + preset.presetName + ' is already active');
    }

    spawnProcess(server);
    writePidFile(server);
    handleOutput(server);

    servers[presetName] = server;
    console.log('Started server', server.name, 'PID:', server.proc.pid);
    return true;
};

var stop = function(presetName) {
    var server = servers[presetName];
    server.proc.kill();
    delete servers[presetName];
    console.log('Stopped server', server.name, 'PID:', server.proc.pid);
    return true;
};

var status = function(server) {
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

var isRunning = function(server) {
    return status(server) === 1;
};

module.exports = {
    // objects
    env: env,
    servers: servers,
    // functions
    start: start,
    stop: stop,
    status: status,
    isRunning: isRunning
};

