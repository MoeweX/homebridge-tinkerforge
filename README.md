# homebridge-tinkerforge

Plugin to support [Tinkerforge](http://www.tinkerforge.com/en) devices on the [HomeBridge Platform](https://github.com/nfarina/homebridge).

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install homebridge-tinkerforge using: npm install -g homebridge-tinkerforge
3. Update your configuration file. See sample-config.json in this repository for a sample.

# Currently Supported Bricklets

Below, find a list of currently supported bricklets and the options available to configure them. If some parameters seem unclear, please check the Tinkerforge API. If a parameter is optional, a standard value is given in square brackets.

## BrickletRemoteSwitch
Fully supported.

* String `accessory`: needs to be "BrickletRemoteSwitch"
* String `uid`: the uid of the BrickletRemoteSwitch
* String `name`: displayed name of object, also used by Siri
* Number `address`: address (or houseCode or systemCode) of to be switched socket
* Number `unit`: unit (or receiverCode or deviceCode) of to be switched socket
* String `host` ["localhost"]: ip address of machine with brickd
* Number `port`: [4223]: socket of brickd
* String `type`: ["switchB"]: type of the to be switched socket ("switchA", "dimB", "switchB" or "switchC")

# How to contribute

Add more bricklet types and improve existent ones. Also solve issues. Maximum line length = 90 characters.

# Notes for implementation

## Possible Characteristics and Services
Description of characteristics (available methods and how to build listener) can be found [here]( https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/Characteristic.js). Characteristics hava a setValue() and a getValue() method.

Overview of all available characteristics and services can be found [here](https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js).

When adding characteristics:
* getCharacteristic: Searches for characteristic in service and returns it. If non existent but optional -> create one and return it
* setCharacteristic: getCharacteristic + setValue()

## Start in Developer Mode

To start the plugin in developer mode run `homebridge -D -P . -U ~/.homebridge-dev/` while beeing in the root directory. A sample config has to be saved at `~/.homebridge-dev/`.
