# homebridge-tinkerforge

Supports Tinkerforge devices on the HomeBridge Platform.

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install homebridge-tinkerforge using: npm install -g homebridge-tinkerforge
3. Update your configuration file. See sample-config.json in this repository for a sample.

# Currently Supported Bricklets

Below, find a list of currently supported bricklets and the options available to configure them. If some parameters seem unclear, please check the Tinkerforge API. If a parameter is optional, a standard value is given in square brackets

## BrickletRemoteSwitch
Currently, only Sockets of type B are supported.

* String `accessory`: needs to be "BrickletRemoteSwitch"
* String `uid`: the uid of the BrickletRemoteSwitch
* String `name`: displayed name of object, also used by Siri
* Number `address`: address of to be switched socket
* Number `unit`: unit of to be switched socket
* String `host` ["localhost"]: ip address of machine with brickd
* Number `port`: [4223]: socket of brickd

# How to contribute

Add more bricklet types and improve existent ones. Also solve issues. Maximum line length = 90 characters.

# Notes for implementation

Description of characteristics (available methods and how to build listener) can be found [here]( https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/Characteristic.js). Characteristics hava a setValue() and a getValue() method.

Overview of all available characteristics and services can be found [here](https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js).

When adding characteristics:
* getCharacteristic: Searches for characteristic in service and returns it. If non existent but optional -> create one and return it
* setCharacteristic: getCharacteristic + setValue()
