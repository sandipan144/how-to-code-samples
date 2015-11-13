# Smart Fire Alarm

## Introduction

This smart fire alarm application is part of a series of how-to Intel® IoT code sample exercises using the Intel® IoT Developer Kit, Intel® Edison development platform, cloud platforms, APIs, and other technologies.

From this exercise, developers will learn how to:
- Connect the Intel® Edison development platform, a�computing platform designed for prototyping and producing IoT and wearable computing products.
- Interface with the Intel® Edison platform IO and sensor repository using MRAA and UPM from the Intel® IoT Developer Kit, a complete hardware and software solution to help developers explore the IoT and implement innovative projects.
- Run this code sample in Eclipse* IoT Edition, an IDE for creating new applications that interact with sensors, actuators, and so on, enabling you to get a quick start on developing software for your Intel® Edison or Galileo board.
- Set up a web application server to store fire alarm data using Azure Redis Cache* from Microsoft* Azure* or Redis Store* from IBM* Bluemix*, both cloud services for connecting IoT solutions including data analysis, machine learning, and a variety of productivity tools to simplify the process of connecting your sensors to the cloud and getting your IoT project up and running quickly.
- Invoke the services of the Twilio* API for sending SMS messages.

## What It Is

Using an Intel® Edison board, this project lets you create a smart fire alarm that:
- constantly monitors for unsafe temperature levels;
- audibly notifies of alerts using the buzzer;
- visually notifies of alerts on the LCD;
- keeps track of fire alarm, using cloud-based data storage;
- sends SMS messages to alert others of the possible fire.

## How It Works

This "smart" fire alarm will monitor the ambient temperature using the Grove* Temperature Sensor.

If the temperature is detected to be above a certain threshold (set to 28 degrees for this example) it sounds an alarm through the buzzer and display an alert on the LCD.

In addition, it can send a SMS to a specified number through Twilio warning them of the possible fire danger.

Optionally, it can also log fire events using the "Intel IoT Example Datastore" running on your own Microsoft* Azure* or IBM* Bluemix* account.

## Hardware requirements

Grove* Starter Kit containing:

1. Intel® Edison with an Arduino* breakout board
2. [Grove* Temperature Sensor](http://iotdk.intel.com/docs/master/upm/node/classes/Grovetemp.html)
3. [Grove* Buzzer](http://iotdk.intel.com/docs/master/upm/node/classes/buzzer.html)
4. [Grove* RGB LCD](http://iotdk.intel.com/docs/master/upm/node/classes/jhd1313m1.html)

## Software requirements

1. [Eclipse* Iot version](https://software.intel.com/en-us/eclipse-getting-started-guide)
2. Microsoft* Azure* or IBM* Bluemix* account
3. Twilio* account

### How To Setup

To begin, clone the Intel® IoT Examples with git on your computer:

    $ git clone https://github.com/intel-iot-devkit/intel-iot-examples.git

Just want to download a ZIP file? Just point your web browser to the Github repo at [https://github.com/intel-iot-devkit/intel-iot-examples](https://github.com/intel-iot-devkit/intel-iot-examples)
and click on the "Download ZIP" button at the lower right. Once the ZIP file has finished downloading, uncompress it, and then use the files in the directory for this example.

## Adding The Code To Eclipse IoT

You use the Eclipse "Import Wizard" to import an existing project into the workspace as follows:

- From the main menu bar, select "File > Import..."
![](./../../../images/cpp/cpp-eclipse-menu.png)

- The "Import wizard" dialog will open.
![](./../../../images/cpp/cpp-eclipse-menu-select-epiw.png)

- Select "General > Existing Project into Workspace" and click on the "Next" button.
![](./../../../images/cpp/cpp-eclipse-menue-epiw-rootdir.png)

- Choose "Select root directory", then click on the associated "Browse" button to locate the directory that contains the project files.
![](./../../../images/cpp/cpp-eclipse-menu-select-rootdir.png)

- Under "Projects" select the directory with the project files which you would like to import.
![](./../../../images/cpp/cpp-eclipse-menue-epiw-rootdir.png)
- Click on the "Finish" button to import the files into Eclipse.

![](./../../../images/cpp/cpp-eclipse-menu-src-loc.png)
- Your main .cpp program will now be in your workspace under the src folder.

### Connecting The Grove* Sensors

![](./../../../images/js/fire-alarm.jpg)

You will need to have the Grove* Shield connected to the Arduino-compatible breakout board, in order to plug in all the various Grove* devices into the Grove* shield. Make sure you have the tiny VCC switch on the Grove* Shield set to the "5V" position.

Plug one end of a Grove* cable into the "Temperature Sensor", then connect the other end to the "A0" port on the Grove* Shield.

Connect one end of a Grove* cable into the "Buzzer", then plug the other end into the "D5" port on the Grove* Shield.

Plug one end of a Grove* cable into the "RGB LCD", then plug the other end into any of the "I2C" ports on the Grove* Shield.

### Intel Edison Setup

This example uses the `restclient-cpp` library to perform REST calls to the server. The code for `restclient-cpp` can be found in the `lib` directory. The `restclient-cpp` library requires the `libcurl` package, which is already installed on the Intel Edison by default.

### Twilio API Key

To optionally send SMS messages, you need to register for an account and get an API key from the Twilio web site: https://www.twilio.com/

You cannot send SMS messages without obtaining a Twilio API key first. You can still run the example, but without the SMS alerts.

To configure the example for the optional SMS sending, obtain a key from the Twilio web site as documented above.

## Data Store Server Setup

Optionally, you can store the data generated by this example program in a backend database deployed using Microsoft* Azure* or IBM* Bluemix*, Node.js, and a Redis data store.
For information on how to setup your own cloud data server, go to:

https://github.com/intel-iot-devkit/intel-iot-examples-datastore

### Connecting Your Edison to the Eclipse IDE

![](./../../../images/cpp/cpp-connection-eclipse-ide-win.png)
1. In the bottom left corner right-click in the area "Target SSH Conections" select "New..." then select "Connection..." and a new screen will appear.

![](./../../../images/cpp/cpp-connection-eclipse-ide-win2.png)
2. In the "filter box" type the name of your edison. In the example mine is JustinEdison.

![](./../../../images/cpp/cpp-connection-eclipse-ide-win3.png)
3. In the "Select one of the found connections list; click on your device name. Then Ok.

![](./../../../images/cpp/cpp-connection-eclipse-ide-win4.png)
4. Your device will now appear in the "Target SSH Connections" area. Right-clickt it and select connect.
(If promted for a username and password the user is 'root' and password is whatever you set it up as when configuring the Edison board)


## Running The Example With The Cloud Server

To run the example with the optional backend datastore you need to set the `SERVER` and `AUTH_TOKEN` environment variables. You can do this in Eclipse by:

1. Select the "Run" menu and choose "Run Configurations". The "Run Configurations" dialog will be displayed.
2. Before running the project be sure sure select your Edison under the "connection" dropdown box.
3. Click on "fire-alarm" under "C/C++ Remote Application". This will display the information for your application.
4. Add the environment variables to the field for "Commands to execute before application" so it ends up looking like this, except using the server and auth token that correspond to your own setup:

```
chmod 755 /tmp/fire-alarm; export SERVER="http://intel-iot-example-data.azurewebsites.net/logger/fire-alarm"; export AUTH_TOKEN="Enter Auth Token Here"; export TWILIO_SID="Enter Twilio SID Here"; export TWILIO_TOKEN="Enter Twilio Token Here"; export TWILIO_TO="Enter Number to Send to here Formattted 555-555-5555"; export TWILIO_FROM="Enter Number to be Sent From Here Formated 555-555-5555"
```

5. Click on the "Apply" button to save your new environment variables.

Now when you run your program using the "Run" button, it should be able to call your server to save the data right from the Edison.

### Running The Code On Edison

![](./../../../images/cpp/cpp-run-eclipse.png)

When you're ready to run the example, you can click on the "Run" icon located in the menubar at the top of the Eclipse editor.
This will compile the program using the Cross G++ Compiler, link it using the Cross G++ Linker, transfer the binary to the Edison, and then execute it on the Edison itself.

![](./../../../images/cpp/cpp-run-eclipse-successful-build.png)

After running the program you should have a similar output as in the image above.

![](./../../../images/cpp/cpp-run-eclipse-successful-output.png)

When the program is finished uploading to the Edison board you will see the temperature output in Celsius.

![](./../../../images/cpp/cpp-run-eclipse-successful-output-sms-sent.png)

When heating the temperature sensor another output message will show similar to the image above. This means you have successfully sent your SMS alert.  
