/*
* Copyright (c) 2015 - 2016 Intel Corporation.
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
* WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

// The program is using the Node.js built-in `fs` module
// to load the config.json and any other files needed
var fs = require("fs");

// The program is using the Node.js built-in `path` module to find
// the file path to needed files on disk
var path = require("path");

// Load configuration data from `config.json` file. Edit this file
// to change to correct values for your configuration
var config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"))
);

var datastore = require("./datastore");
const services = require("./services");

// Initialize the hardware devices
var mraa = require("mraa");
// pins
var lineFinderPin = 2,
    stepper1input1 = 9, stepper1input2 = 10,
    stepper1input3 = 11, stepper1input4 = 12,
    stepper2input1 = 4, stepper2input2 = 5,
    stepper2input3 = 6, stepper2input4 = 7;

if (config.platform == "firmata") {
  // open connection to firmata
  mraa.addSubplatform(mraa.GENERIC_FIRMATA, "/dev/ttyACM0");

  lineFinderPin += 512;
  stepper1input1 += 512;
  stepper1input2 += 512;
  stepper1input3 += 512;
  stepper1input4 += 512;
  stepper2input1 += 512;
  stepper2input2 += 512;
  stepper2input3 += 512;
  stepper2input4 += 512;
}

// Initialize the hardware devices
var ULN200XA = require("jsupm_uln200xa");
var lineFinder = new (require("jsupm_grovelinefinder").GroveLineFinder)(lineFinderPin),
    right = new ULN200XA.ULN200XA(4096, stepper1input1, stepper1input2, stepper1input3, stepper1input4),
    left = new ULN200XA.ULN200XA(4096, stepper2input1, stepper2input2, stepper2input3, stepper2input4);

var looking = "left";

// Helper function indicates we found a line
function line() {
  if (config.WHITE_LINES) {
    return lineFinder.whiteDetected();
  }
  return lineFinder.blackDetected();
}

// Moves any of the stepper motors
function move(stepper) {
  return function(steps, dir, speed) {
    stepper.setSpeed(speed || 5);
    stepper.setDirection(dir || config.CLOCKWISE);
    stepper.stepperSteps(steps || 1024);
  };
}

// Defines helper functions to move specific stepper motor
right.move = move(right);
left.move = move(left);

// Find a line
function findLine() {
  console.log("finding line");

  if (looking === "left") {
    left.move(512);
    looking = "right";
  } else {
    right.move(512);
    looking = "left";
  }
}

// Move the robot forward
function moveForward() {
  console.log("moving forward");
  left.move(1024);
  right.move(1024);
}

// Store record in the remote datastore when robot is active
function log(callback) {
  console.log("robot active");

  var payload = { value: new Date().toISOString() };
  console.log(payload);
  datastore.log(config, payload);
  services.log(config, payload);
}

// The main function repeatedly calls `findLine()`
// to try to locate a black line on the ground using the sensor.
// It then logs that the robot is active to the remote datastore,
// and tries to move forward.
function main() {
  setInterval(function() {
    if (line()) {
      log();
      moveForward();
    } else {
      findLine();
    }
  }, 100);
}

main();
