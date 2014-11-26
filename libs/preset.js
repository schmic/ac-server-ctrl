var fs = require('fs');
var path = require('path');
var env = require('./env');

var getPresetPath = function(presetName) {
    return path.join(env.getPresetsPath(), presetName);
};

var readIni = function (filePath, fileName) {
    var content = fs.readFileSync(path.join(filePath, fileName)).toString('UTF-8');
    return require('ini').parse(content);
};

var getTimeOfDay = function (sunAngle) {
    // base time for angle=0: 1PM // 13:00
    // min/max: -/+ 80
    var someDate = new Date(1970, 1, 1, 13, 0, 0, 0);
    someDate.setMinutes(someDate.getMinutes() + (sunAngle / 16 * 60));
    return someDate.toLocaleTimeString();
};

var getCars = function (c) {
    return c.split(';');
};

var getTracks = function (t) {
    return t.split(';');
};

var asString = function (allowedValue) {
    switch(allowedValue) {
        case '0':
            return false;
        case '1':
            return true;
        case '2':
            return 'factory';
        default:
            return undefined;
    }
};

function Preset(presetName) {
    var presetPath = getPresetPath(presetName);
    var ini = readIni(presetPath, 'server_cfg.ini');
    var entries = readIni(presetPath, 'entry_list.ini');
    return {
        presetPath: presetPath,
        presetName: presetName,
        serverName: ini.SERVER.NAME,
        cars: getCars(ini.SERVER.CARS),
        tracks: getTracks(ini.SERVER.TRACK),
        timeOfDay: getTimeOfDay(ini.SERVER.SUN_ANGLE),
        getTCAllowed: asString(ini.SERVER.TC_ALLOWED),
        getABSAllowed: asString(ini.SERVER.ABS_ALLOWED),
        getStabilityAllowed: asString(ini.SERVER.STABILITY_ALLOWED),
        getAutoClutchAllowed: asString(ini.SERVER.AUTOCLUTCH_ALLOWED),
        hasPassword: ini.SERVER.PASSWORD !== undefined,
        hasPenalties : ini.SERVER.ALLOWED_TYRES_OUT < 4,
        hasPickupMode: ini.SERVER.PICKUP_MODE_ENABLED === 1,
        hasRegisterToLobby: ini.SERVER.REGISTER_TO_LOBBY === 1,
        hasTyreWear: ini.SERVER.TYRE_WEAR_RATE > 0,
        hasFuelUsage: ini.SERVER.FUEL_RATE > 0,
        hasDamage: ini.SERVER.DAMAGE_MULTIPLIER > 0,
        hasDynamicTrack: ini.DYNAMIC_TRACK !== undefined,
        dynamicTrack: ini.DYNAMIC_TRACK,
        hasBookingSession: ini.BOOK !== undefined,
        bookingSession: ini.BOOK,
        hasPracticeSession: ini.PRACTICE !== undefined,
        practiceSession: ini.PRACTICE,
        hasQualifySession: ini.QUALIFY !== undefined,
        qualifySession: ini.QUALIFY,
        hasRaceSession: ini.RACE !== undefined,
        raceSession: ini.RACE,
        ini: ini,
        entries: entries,
        getEntryBy: function(attr, value) {
            Object.keys(entries).forEach(function(k) {
                if(entries[k][attr] == value)
                    return entries[k];
            });
        }
    };
}

module.exports = Preset;
