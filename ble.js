/*
BLE SERIAL

Based directly on the working BLE reference provided.

This file ONLY handles Bluetooth:
- Connect to ESP32
- Find TX/RX characteristics
- Send commands to ESP32
- Receive notifications from ESP32
*/


// =====================================================
// BLE UUIDs
// SAME UUIDs AS WORKING REFERENCE
// =====================================================

const serviceUuid =
  "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

// Phone -> ESP32
const txCharacteristic =
  "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

// ESP32 -> Phone
const rxCharacteristic =
  "6e400003-b5a3-f393-e0a9-e50e24dcca9e";


// =====================================================
// BLE VARIABLES
// =====================================================

let myCharacteristicRx;
let myCharacteristicTx;

let myBLE;

let bleConnected = false;

let connectButton;


// =====================================================
// BLE SETUP
// =====================================================

function bleSetup() {

  myBLE = new p5ble();


  // Create BLE Connect button

  connectButton =
    createButton("Connect BLE");


  connectButton.position(
    20,
    95
  );


  connectButton.style(
    "padding",
    "10px 16px"
  );


  connectButton.style(
    "border",
    "2px solid #37352F"
  );


  connectButton.style(
    "border-radius",
    "999px"
  );


  connectButton.style(
    "background",
    "#DCE6F2"
  );


  connectButton.style(
    "color",
    "#37352F"
  );


  connectButton.style(
    "font-size",
    "14px"
  );


  connectButton.mousePressed(
    connectAndStartNotify
  );
}


// =====================================================
// CONNECT TO BLE DEVICE
// =====================================================

function connectAndStartNotify() {

  console.log(
    "Searching for BLE device..."
  );


  myBLE.connect(
    serviceUuid,
    gotCharacteristics
  );
}


// =====================================================
// GET BLE CHARACTERISTICS
// =====================================================

function gotCharacteristics(
  error,
  characteristics
) {

  if (error) {

    console.log(
      "BLE error:",
      error
    );

    return;
  }


  console.log(
    "Characteristics found:",
    characteristics.length
  );


  for (
    let i = 0;
    i < characteristics.length;
    i++
  ) {

    // -----------------------------------------
    // ESP32 -> PHONE
    // -----------------------------------------

    if (
      rxCharacteristic ===
      characteristics[i].uuid
    ) {

      myCharacteristicRx =
        characteristics[i];


      myBLE.startNotifications(
        myCharacteristicRx,
        handleNotifications,
        "string"
      );
    }


    // -----------------------------------------
    // PHONE -> ESP32
    // -----------------------------------------

    else if (
      txCharacteristic ===
      characteristics[i].uuid
    ) {

      myCharacteristicTx =
        characteristics[i];
    }
  }


  // ===================================================
  // CONNECTION READY
  // ===================================================

  if (
    myCharacteristicTx
  ) {

    bleConnected = true;


    connectButton.html(
      "BLE Connected"
    );


    connectButton.style(
      "background",
      "#DDE8D5"
    );


    console.log(
      "BLE READY"
    );
  }
}


// =====================================================
// RECEIVE FROM ESP32
// =====================================================

function handleNotifications(data) {

  console.log(
    "ESP32:",
    data
  );
}


// =====================================================
// SEND SERVO NUMBER
// =====================================================

function sendServoCommand(
  servoNumber
) {

  if (
    !bleConnected ||
    !myCharacteristicTx
  ) {

    console.log(
      "BLE NOT CONNECTED"
    );

    statusText =
      "Target hit - BLE not connected";

    return;
  }


  const message =
    String(
      servoNumber
    );


  // THIS IS THE SAME BLE SEND METHOD
  // USED IN THE WORKING REFERENCE

  myBLE.write(
    myCharacteristicTx,
    message
  );


  console.log(
    "BLE SENT:",
    message
  );


  statusText =
    "Target " +
    servoNumber +
    " sent to ESP32";
}
