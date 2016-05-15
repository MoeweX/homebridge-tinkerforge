var Service, Characteristic;
var Tinkerforge = require("tinkerforge");

module.exports = function(homebridge){
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    // registration of each accessory
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
  this.type = config["type"] || "switchB";

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

        if (this.type == "dimB") {
            var dimService = new Service.Lightbulb();
            // implement on/off
            dimService
                .getCharacteristic(Characteristic.On)
                .on('set', function(value, callback) {
                    var that = this;
                    this.performRemoteSwitchOperation(value, that, callback);
                }.bind(this));
            // implement dimming
            dimService
                .getCharacteristic(Characteristic.Brightness)
                .on('set', function(value, callback) {
                    var that = this;
                    this.performRemoteSwitchOperation(value, that, callback, true);
                }.bind(this));
            // set name
            dimService
                .setCharacteristic(Characteristic.Name, this.name);

            return [informationService, dimService];
        } else {
            var switchService = new Service.Switch();
            // implement on/off
            switchService
                .getCharacteristic(Characteristic.On)
                .on('set', function(value, callback) {
                  var that = this;
                  this.performRemoteSwitchOperation(value, that, callback);
                }.bind(this));
            // set name
            switchService
                .setCharacteristic(Characteristic.Name, this.name);

            return [informationService, switchService];
        }
    },

    /*
        This function performs the correct operation on the bricklet depending on the
        type of the socket. Possible types are switchA, dimB, switchB, switchC.
    */
    performRemoteSwitchOperation(value, that, callback) {
        that.remoteSwitch.getSwitchingState(function(v1, v2, state) {
            switch (state) {
                case 0:
                    // remote switch connected and ready
                    if (value > 1) {
                        var dimValue = Math.round(value/6.67); // dimSocket takes 0 to 15
                        that.log("Dimming socket to " + dimValue + "/15");
                        that.remoteSwitch.dimSocketB(that.address, that.unit, dimValue);
                        callback();
                    } else {
                        switch (that.type) {
                            case "switchA":
                                that.log("Switching socket to " + value);
                                that.remoteSwitch.switchSocketA(that.address,
                                    that.unit, value);
                                callback();
                                break;
                            case "switchB":
                                that.log("Switching socket to " + value);
                                that.remoteSwitch.switchSocketB(that.address,
                                    that.unit, value);
                                callback();
                                break;
                            case "dimB":
                                that.log("Switching socket to " + value);
                                that.remoteSwitch.switchSocketB(that.address,
                                    that.unit, value);
                                callback();
                                break;
                            case "switchC":
                                that.log("Switching socket to " + value);
                                that.remoteSwitch.switchSocketC(""+that.address,
                                that.unit, value);
                                callback();
                                break;
                            default:
                                that.log("Unsupported type " + that.type);
                                callback(1);

                        }
                    }
                    break;
                case 1:
                    // remote switch connected but busy
                    setTimeout(that.performRemoteSwitchOperation(value, that, callback),
                        10000);
                    break;
                default:
                    // something unexpected happened.
                    that.log("An unexpected error occured, bricklet state = " + state);
                    callback(state);
            }
        }.bind(value, that, callback), function() {
            that.log("Bricklet " + that.uid + " not connected at host " + that.host);
            callback(1);
        }.bind(that));
    }
}
