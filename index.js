var Service, Characteristic;
var Tinkerforge = require("tinkerforge");

var ipcon = null;

module.exports = function(homebridge){
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    // Registration of each accessory
    homebridge.registerAccessory(
        "homebridge-tinkerforge",
        "BrickletRemoteSwitch",
        BrickletRemoteSwitch);
}

//****************************************************************************************
// General Functions
//****************************************************************************************

function logValue(value) {
    console.log(value);
}

function getIPConnection(host, port) {
    var ipcon = new Tinkerforge.IPConnection();
    ipcon.connect(host, port);
    return ipcon;
}

//****************************************************************************************
// Bricklet Remote Switch
//****************************************************************************************

function BrickletRemoteSwitch(log, config) {
  this.log = log;

  // parse config
  this.name = config["name"];
  this.uid = config["uid"];
  this.address = config["address"];
  this.unit = config["unit"];
  this.host = config["host"] || "localhost";
  this.port = config["port"] || 4223;

  // get IPConnection and connect to brickd
  this.ipcon = getIPConnection(this.host, this.port)
  this.remoteSwitch = new Tinkerforge.BrickletRemoteSwitch(this.uid, this.ipcon);

  log.info("Initialized BrickletRemoteSwitch Accessory " + this.name);
}

BrickletRemoteSwitch.prototype = {
    getServices: function() {

        var informationService = new Service.AccessoryInformation();
        informationService
            .setCharacteristic(Characteristic.Manufacturer, "Tinkerforge")
            .setCharacteristic(Characteristic.Model, "BrickletRemoteSwitch");

        var switchService = new Service.Switch();
        switchService
            .getCharacteristic(Characteristic.On)
            .on('set', function(value, callback) {
              var that = this;
              this.switchSocketB(value, that, callback);
            }.bind(this));
        switchService
            .setCharacteristic(Characteristic.Name, this.name)

        return [informationService, switchService];
    },

    switchSocketB: function(value, that, callback) {
        //TODO check first whether the bricklet is available
        that.remoteSwitch.getSwitchingState(function(v1, v2, state) {
            switch (state) {
                case 0:
                    //connected and ready
                    that.log("Switching socket to " + value);
                    that.remoteSwitch.switchSocketB(that.address, that.unit, value);
                    callback();
                    break;
                case 1:
                    //connected but busy
                    setTimeout(that.switchSocketB(value, that, callback), 10000);
                    break;
                default:
                    //Something unexpected happened.
                    that.log("Am unexpected error occured, bricklet state = " + state);
                    callback(state);
            }
        }.bind(value, that, callback));
    }
}
