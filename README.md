ac-server-ctrl
======
##### Assetto Corsa Server Control

## About
ac-server-ctrl is a [NodeJS](http://www.nodejs.org) application to handle [Assetto Corsa](http://assettocorsa.net)-Server processes easier.

When you `start` ac-server-ctrl by providing the name of a preset all needed configuration files get copied from the preset
directory to a `working directory`. After that a separat acServer-process starts. A .pid- and .log-file is created in
the servers `working directory`.

If you want to help please open [issues](https://github.com/schmic/ac-server-ctrl/issues) or send in [pull-requests](https://help.github.com/articles/creating-a-pull-request).

## Requirements
#### Software
 * Working [NodeJS](http://nodejs.org/download/) installation
 * [npm](https://www.npmjs.org/) integrated into NodeJS

#### AC Dedicated Server
* Install the [Assetto Corsa Dedicated Server](http://steamdb.info/app/302550/)
* either use:
    * your normal [Steam-Client](http://store.steampowered.com/about/)
    * [SteamCMD](https://developer.valvesoftware.com/wiki/SteamCMD)
        * Please read [this](https://github.com/schmic/ac-server-ctrl/wiki/Install-AC-Server-via-SteamCMD) for further details

## Preparation/Installation
* Create a directory and name it `AC`
* Download the [latest release](https://github.com/schmic/ac-server-ctrl/releases) of ac-server-ctrl
    * if you want you can grab the latest [dev-version](https://github.com/schmic/ac-server-ctrl/archive/master.zip)
    * or clone the whole repository: [https://github.com/schmic/ac-server-ctrl.git](https://github.com/schmic/ac-server-ctrl.git)
* Extract/Clone ac-server-ctrl to `[...]\AC\acServerCtrl`
* Install/Copy the AC-Dedicated-Server to `[...]\AC\acServer`
    * ac-server-ctrl is looking in the relative path `..\acServer` for it

#### Install dependencies
* Open Dos-Box/Shell
* change to `[...]\AC\acServerCtrl`
    ```$> cd C:\AC\acServerCtrl ```
* tell npm to install dependencies
    ```$> npm install ```

## Usage
 * Start ac-server-ctrl with at least one preset
 ```$> node C:\AC\acServerCtrl\acCtrl.js start -p PresetA```
