var Service, Characteristic;
var Tinkerforge = require("tinkerforge");

module.exports = function(homebridge){
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-tinkerforge", "Tinkerforge", TinkerforgeAccessory);
}

function TinkerforgeAccessory(log, config) {
  this.log = log;

  // parse config
  this.bricklet_type = config["bricklet_type"];
  this.name = config["name"];
  this.address = config["address"];
  this.unit = config["unit"];

  var HOST = '192.168.0.248';
  var PORT = 4223;

  // Create connection and connect to brickd
  this.ipcon = new Tinkerforge.IPConnection();
  this.ipcon.connect(HOST, PORT);

  log.info("Created Tinkerforge-Accessory " + this.name);
}

TinkerforgeAccessory.prototype = {
    getServices: function() {

        var informationService = new Service.AccessoryInformation();
        informationService
            .setCharacteristic(Characteristic.Manufacturer, "Tinkerforge")
            .setCharacteristic(Characteristic.Model, this.bricklet_type)

        var lightbulbService = new Service.Lightbulb();
        lightbulbService
            .getCharacteristic(Characteristic.On)
            .on('set', function(value, callback) {
              this.log("Light -> " + value);
              var remoteSwitch = new Tinkerforge.BrickletRemoteSwitch("nXN", this.ipcon);
              remoteSwitch.switchSocketB(this.address, this.unit, value);
              callback()
            }.bind(this));
        lightbulbService
            .setCharacteristic(Characteristic.Name, this.name)

        return [informationService, lightbulbService];
    }
}
