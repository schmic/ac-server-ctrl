var path = require('path');
var fs = require('fs');
var cfg = require('config');

var isWindows = require('os').platform().match(/win/i);

exports.getACPath = function() {
    return cfg.get('ac.path');
};

exports.getServerExecutable = function() {
    return path.join(this.getACPath(), isWindows ? 'acServer.exe' : 'acServer');
};

exports.getServersPath = function() {
    return path.join(this.getACPath(), 'servers');
};

exports.getPresetsPath = function() {
    return path.join(this.getACPath(), 'presets');
};

exports.getTracksPath = function() {
    return path.join(this.getACPath(), 'content', 'tracks');
};

exports.getCarsPath = function() {
    return path.join(this.getACPath(), 'content', 'cars');
};

exports.getPresetNames = function (filter) {
    var presetRegExp = new RegExp(filter, 'i');
    var presetsMatched = [];
    var presetsPath = this.getPresetsPath();
    fs.readdirSync(presetsPath).every(
        function checkItem(dirItem) {
            if (dirItem.match(presetRegExp)) {
                if (fs.lstatSync(path.join(presetsPath, dirItem)).isDirectory()) {
                    presetsMatched.push(dirItem);
                }
            }

            return true;
        }
    );
    return presetsMatched;
};

exports.getPreset = function (presetName) {
    return require('./preset')(presetName);
};

require('fs-extra').ensureDirSync(exports.getServersPath());

if(!fs.existsSync(exports.getServerExecutable())) {
    console.error('AC server binary "' + exports.getServerExecutable() + '" not found, aborting ...');
    console.error(' Please execute acCtrl from within the AC Dedicated Server Directory');
    process.exit(1);
}
