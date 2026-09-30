/*
BLE SERIAL
Based directly on the working reference files.
*/

const serviceUuid =
  "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

const txCharacteristic =
  "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

const rxCharacteristic =
  "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

let myCharacteristicRx;
let myCharacteristicTx;
let myBLE;

let bleConnected = false;
let connectButton;


// =====================================================
// SETUP BLE BUTTON
// =====================================================

function bleSetup() {

  myBLE = new p5ble();

  connectButton =
    createButton("Connect BLE");

  connectButton.position(20, 95);

  connectButton.mousePressed(
    connectAndStartNotify
  );
}


// =====================================================
// CONNECT
// =====================================================

function connectAndStartNotify() {

  console.log("CONNECT PRESSED");

  myBLE.connect(
    serviceUuid,
    gotCharacteristics
  );
}


// =====================================================
// CHARACTERISTICS FOUND
// =====================================================

function gotCharacteristics(
  error,
  characteristics
) {

  if (error) {

    console.log(
      "BLE CONNECTION ERROR:",
      error
    );

    return;
  }


  console.log(
    "GOT CHARACTERISTICS:",
    characteristics.length
  );


  for (
    let i = 0;
    i < characteristics.length;
    i++
  ) {

    console.log(
      "FOUND UUID:",
      characteristics[i].uuid
    );


    if (
      rxCharacteristic ==
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


    else if (
      txCharacteristic ==
      characteristics[i].uuid
    ) {

      myCharacteristicTx =
        characteristics[i];
    }
  }


  // ===================================================
  // CONFIRM TX EXISTS
  // ===================================================

  if (myCharacteristicTx) {

    bleConnected = true;

    connectButton.html(
      "BLE Connected"
    );

    console.log(
      "BLE FULLY CONNECTED"
    );

  }

  else {

    console.log(
      "CONNECTED BUT TX CHARACTERISTIC NOT FOUND"
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
// SEND SERVO COMMAND
// =====================================================

function sendServoCommand(
  servoNumber
) {

  if (
    !bleConnected ||
    !myCharacteristicTx
  ) {

    console.log(
      "BLE NOT READY"
    );

    return;
  }


  const message =
    String(servoNumber);


  console.log(
    "SENDING:",
    message
  );


  myBLE.write(
    myCharacteristicTx,
    message
  );
}
