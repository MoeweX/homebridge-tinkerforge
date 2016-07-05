var Service, Characteristic;
var Tinkerforge = require("tinkerforge");

module.exports = function(homebridge){
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    // registration of each accessory
    homebridge.registerAccessory("homebridge-tinkerforge","BrickletRemoteSwitch",BrickletRemoteSwitch);
}

//**************************************************************************************************
// General Functions
//**************************************************************************************************

function logValue(value) {
    console.log(value);
}

function getIPConnection(host, port) {
    var ipcon = new Tinkerforge.IPConnection();
    ipcon.connect(host, port);
    return ipcon;
}

//**************************************************************************************************
// Bricklet Remote Switch
//**************************************************************************************************

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
  this.remoteSwitch.setResponseExpected(Tinkerforge.BrickletRemoteSwitch.FUNCTION_SWITCH_SOCKET_A, true);
  this.remoteSwitch.setResponseExpected(Tinkerforge.BrickletRemoteSwitch.FUNCTION_SWITCH_SOCKET_B, true);
  this.remoteSwitch.setResponseExpected(Tinkerforge.BrickletRemoteSwitch.FUNCTION_SWITCH_SOCKET_C, true);
  this.remoteSwitch.setResponseExpected(Tinkerforge.BrickletRemoteSwitch.FUNCTION_DIM_SOCKET_B, true);

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
                    this.performRemoteSwitchOperation(value, that, callback);
                }.bind(this));
            // set name
            dimService.setCharacteristic(Characteristic.Name, this.name);

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
            switchService.setCharacteristic(Characteristic.Name, this.name);

            return [informationService, switchService];
        }
    },

    /*
        This function performs the correct operation on the bricklet depending on the
        type of the socket. Possible types are switchA, dimB, switchB, switchC.
    */
    performRemoteSwitchOperation(value, that, callback) {
        var rerunMethod = function() {
            setTimeout(function() {
                that.performRemoteSwitchOperation(value, that, callback);
            }, 100);
        }

        var switchingSuccessfull = function() {
            if (value > 1) {
                that.log("Dimming socket to " + value + "%");
            } else {
                that.log("Switching socket to " + value);
            }
            callback();
        }

        that.remoteSwitch.getSwitchingState(
            function(state) {
                switch (state) {
                    case 0:
                        // remote switch connected and ready
                        if (value > 1) {
                            var dimValue = Math.round(value/6.67); // dimSocket takes 0 to 15
                            that.remoteSwitch.dimSocketB(that.address,that.unit,dimValue,switchingSuccessfull,rerunMethod);
                        } else {
                            switch (that.type) {
                                case "switchA":
                                    that.remoteSwitch.switchSocketA(that.address,that.unit,value,switchingSuccessfull,rerunMethod);
                                    break;
                                case "switchB":
                                    that.remoteSwitch.switchSocketB(that.address,that.unit,value,switchingSuccessfull,rerunMethod);
                                    break;
                                case "dimB":
                                    that.remoteSwitch.switchSocketB(that.address,that.unit,value,switchingSuccessfull,rerunMethod);
                                    break;
                                case "switchC":
                                    that.log("Switching socket to " + value);
                                    that.remoteSwitch.switchSocketC(""+that.address,that.unit,value,switchingSuccessfull,rerunMethod);
                                    break;
                                default:
                                    that.log("Unsupported type " + that.type);
                                    callback(1);
                            }
                        }
                        break;
                    case 1:
                        // remote switch connected but busy
                        rerunMethod();
                        break;
                    default:
                        // something unexpected happened.
                        that.log("An unexpected error occured, bricklet state = " + state);
                        callback(state);
                }
            },
            function() {
                that.log("Bricklet " + that.uid + " not connected at host " + that.host);
                callback(1);
            });
    }
}
