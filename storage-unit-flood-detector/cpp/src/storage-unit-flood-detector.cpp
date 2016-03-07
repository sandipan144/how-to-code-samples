/*
 * Copyright (c) 2015 Intel Corporation.
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

#include <stdlib.h>
#include <iostream>
#include <signal.h>
#include <ctime>
#include <sstream>

#include <grove.h>
#include <grovemoisture.h>
#include <grovespeaker.h>

#include "../lib/restclient-cpp/include/restclient-cpp/restclient.h"

using namespace std;

// Send notification to remote datastore
void notify() {
  if (!getenv("SERVER") || !getenv("AUTH_TOKEN")) {
    return;
  }

  std::time_t now = std::time(NULL);
  char mbstr[sizeof "2011-10-08T07:07:09Z"];
  std::strftime(mbstr, sizeof(mbstr), "%FT%TZ", std::localtime(&now));

  std::stringstream payload;
  payload << "{\"value\":";
  payload << "\"" << mbstr << "\"}";

  RestClient::headermap headers;
  headers["X-Auth-Token"] = getenv("AUTH_TOKEN");

  RestClient::response r = RestClient::put(getenv("SERVER"), "text/json", payload.str(), headers);
  std::cout << "Datastore called. Result:" << r.code << std::endl;
  std::cout << r.body << std::endl;
}

// The hardware devices that the example is going to connect to
struct Devices
{
  upm::GroveSpeaker* speaker;
  upm::GroveMoisture* moisture;

  Devices(){
  };

  // Initialization function
  void init() {
    // speaker connected to D5 (digital out)
    speaker = new upm::GroveSpeaker(5);

    // moisture sensor on analog (A0)
    moisture = new upm::GroveMoisture(0);
  }

  // Cleanup on exit
  void cleanup() {
    delete speaker;
    delete moisture;
  }

  // Starts the alarm
  void alarm() {
    cout << "Alert! Water is Detected!";
    speaker->playSound('c', true, "high");
    notify();
  }

  // Every 1 second, reads the moisture sensor
  void sense_moisture() {
    for (;;) {
      int val = moisture->value();
      cout << "Moisture value: " << val << ", ";
      if (val >= 0 && val < 300)
          cout << "dry";
      else if (val >= 300 && val < 600)
          cout << "moist";
      else
          cout << "wet";

      cout << endl;

      if (val >= 300)
         alarm();

      cout << endl;
      sleep(1);
    }
  }
};

Devices devices;

// Exit handler for program
void exit_handler(int param)
{
  devices.cleanup();
  exit(1);
}

// The main function for the example program
int main()
{
  // handles ctrl-c or other orderly exits
  signal(SIGINT, exit_handler);

  // check that we are running on Galileo or Edison
  mraa_platform_t platform = mraa_get_platform_type();
  if ((platform != MRAA_INTEL_GALILEO_GEN1) &&
    (platform != MRAA_INTEL_GALILEO_GEN2) &&
    (platform != MRAA_INTEL_EDISON_FAB_C)) {
    std::cerr << "ERROR: Unsupported platform" << std::endl;
    return MRAA_ERROR_INVALID_PLATFORM;
  }

  // create and initialize UPM devices
  devices.init();
  devices.sense_moisture();

  return 0;
}