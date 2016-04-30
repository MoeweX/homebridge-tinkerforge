var Service, Characteristic;
var Tinkerforge = require("tinkerforge");

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

  // Create connection and connect to brickd
  this.ipcon = new Tinkerforge.IPConnection();
  this.ipcon.connect(this.host, this.port);
  this.remoteSwitch = new Tinkerforge.BrickletRemoteSwitch(this.uid, this.ipcon);

  log.info("Initialized BrickletRemoteSwitch Accessory " + this.name);
}

BrickletRemoteSwitch.prototype = {
    getServices: function() {

        var informationService = new Service.AccessoryInformation();
        informationService
            .setCharacteristic(Characteristic.Manufacturer, "Tinkerforge")
            .setCharacteristic(Characteristic.Model, "BrickletRemoteSwitch");

        var lightbulbService = new Service.Lightbulb();
        lightbulbService
            .getCharacteristic(Characteristic.On)
            .on('set', function(value, callback) {
              this.log(this.name + " -> " + value);
              this.remoteSwitch.switchSocketB(this.address, this.unit, value);
              callback()
            }.bind(this));
        lightbulbService
            .setCharacteristic(Characteristic.Name, this.name)

        return [informationService, lightbulbService];
    }
}
