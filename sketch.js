/*
EXPERIMENT 1E

GYROSCOPE BALL + BLE SERIAL

iPhone tilt
      ↓
ball moves
      ↓
ball hits target
      ↓
BLE sends 1 / 2 / 3 / 4
      ↓
ESP32

Later ESP32 mapping:

1 -> Channel 12
2 -> Channel 13
3 -> Channel 14
4 -> Channel 15
*/


// =====================================================
// BALL
// =====================================================

let ballX;
let ballY;

let velocityX = 0;
let velocityY = 0;

const ballRadius = 24;


// =====================================================
// MOTION
// =====================================================

let tiltEnabled = false;

let motionBaselineX = null;
let motionBaselineY = null;


// =====================================================
// PHYSICS
// =====================================================

const tiltStrength = 0.055;


// WORKING FRICTION VALUE
const friction = 0.98;


const maxSpeed = 9;


// =====================================================
// TARGETS
// =====================================================

let targets = [];


// =====================================================
// INTERFACE
// =====================================================

let enableButton;


let statusText =
  "Connect BLE, then enable tilt";


let debugText =
  "X: 0.00   Y: 0.00";


// =====================================================
// SETUP
// =====================================================

function setup() {

  createCanvas(
    windowWidth,
    windowHeight
  );


  // ===================================================
  // BLE
  // ===================================================

  bleSetup();


  // ===================================================
  // BALL
  // ===================================================

  ballX =
    width / 2;


  ballY =
    height / 2;


  // ===================================================
  // TARGETS
  // ===================================================

  targets = [

    {
      x: width * 0.20,
      y: height * 0.27,
      active: false,
      colour: "#F4D7D7"
    },

    {
      x: width * 0.80,
      y: height * 0.27,
      active: false,
      colour: "#DDE8D5"
    },

    {
      x: width * 0.20,
      y: height * 0.75,
      active: false,
      colour: "#DCE6F2"
    },

    {
      x: width * 0.80,
      y: height * 0.75,
      active: false,
      colour: "#EEE0F3"
    }

  ];


  // ===================================================
  // ENABLE TILT BUTTON
  // ===================================================

  enableButton =
    createButton(
      "Enable Tilt"
    );


  enableButton.position(
    width / 2,
    height / 2
  );


  enableButton.style(
    "transform",
    "translate(-50%, -50%)"
  );


  enableButton.style(
    "padding",
    "16px 28px"
  );


  enableButton.style(
    "border",
    "2px solid #37352F"
  );


  enableButton.style(
    "border-radius",
    "999px"
  );


  enableButton.style(
    "background",
    "#F4D7D7"
  );


  enableButton.style(
    "color",
    "#37352F"
  );


  enableButton.style(
    "font-size",
    "17px"
  );


  enableButton.style(
    "font-weight",
    "600"
  );


  enableButton.mousePressed(
    requestMotionPermission
  );
}


// =====================================================
// DRAW
// =====================================================

function draw() {

  background(
    "#F7F6F3"
  );


  // ===================================================
  // TITLE
  // ===================================================

  noStroke();


  fill(
    "#37352F"
  );


  textSize(
    24
  );


  textStyle(
    BOLD
  );


  text(
    "Tilt to move",
    24,
    48
  );


  textStyle(
    NORMAL
  );


  textSize(
    14
  );


  fill(
    "#787774"
  );


  text(
    "Roll the ball into the circles.",
    24,
    72
  );


  // ===================================================
  // BALL PHYSICS
  // ===================================================

  if (
    tiltEnabled
  ) {

    velocityX *=
      friction;


    velocityY *=
      friction;


    velocityX =
      constrain(
        velocityX,
        -maxSpeed,
        maxSpeed
      );


    velocityY =
      constrain(
        velocityY,
        -maxSpeed,
        maxSpeed
      );


    ballX +=
      velocityX;


    ballY +=
      velocityY;
  }


  // ===================================================
  // SCREEN BOUNDARIES
  // ===================================================


  // LEFT

  if (
    ballX <
    ballRadius
  ) {

    ballX =
      ballRadius;


    velocityX *=
      -0.4;
  }


  // RIGHT

  if (
    ballX >
    width -
    ballRadius
  ) {

    ballX =
      width -
      ballRadius;


    velocityX *=
      -0.4;
  }


  // TOP

  if (
    ballY <
    135
  ) {

    ballY =
      135;


    velocityY *=
      -0.4;
  }


  // BOTTOM

  if (
    ballY >
    height -
    ballRadius
  ) {

    ballY =
      height -
      ballRadius;


    velocityY *=
      -0.4;
  }


  // ===================================================
  // DRAW TARGETS
  // ===================================================

  drawTargets();


  // ===================================================
  // DRAW BALL
  // ===================================================

  noStroke();


  fill(
    "#37352F"
  );


  circle(
    ballX,
    ballY,
    ballRadius * 2
  );


  // ===================================================
  // COLLISION
  // ===================================================

  checkCollisions();


  // ===================================================
  // DEBUG
  // ===================================================

  fill(
    "#9B9A97"
  );


  textSize(
    12
  );


  text(
    debugText,
    24,
    height - 46
  );


  textAlign(
    CENTER
  );


  text(
    statusText,
    width / 2,
    height - 24
  );


  textAlign(
    LEFT
  );
}


// =====================================================
// DRAW TARGETS
// =====================================================

function drawTargets() {

  for (
    let i = 0;
    i < targets.length;
    i++
  ) {

    const target =
      targets[i];


    fill(
      target.colour
    );


    if (
      target.active
    ) {

      stroke(
        "#37352F"
      );


      strokeWeight(
        4
      );

    }

    else {

      stroke(
        55,
        53,
        47,
        40
      );


      strokeWeight(
        2
      );
    }


    circle(
      target.x,
      target.y,
      target.active
        ? 106
        : 95
    );
  }


  noStroke();
}


// =====================================================
// REQUEST IPHONE MOTION ACCESS
// =====================================================

function requestMotionPermission() {

  statusText =
    "Requesting motion access...";


  if (
    typeof DeviceMotionEvent !==
    "undefined" &&

    typeof DeviceMotionEvent
      .requestPermission ===
    "function"
  ) {

    DeviceMotionEvent
      .requestPermission()

      .then(

        function(response) {

          if (
            response ===
            "granted"
          ) {

            startMotion();

          }

          else {

            statusText =
              "Motion permission denied";
          }
        }
      )

      .catch(

        function(error) {

          console.log(
            error
          );


          statusText =
            "Motion permission error";
        }
      );

  }

  else {

    startMotion();
  }
}


// =====================================================
// START MOTION
// =====================================================

function startMotion() {

  tiltEnabled =
    true;


  motionBaselineX =
    null;


  motionBaselineY =
    null;


  window.addEventListener(
    "devicemotion",
    handleMotion
  );


  enableButton.hide();


  if (
    typeof bleConnected !==
    "undefined" &&
    bleConnected
  ) {

    statusText =
      "BLE connected - tilt your phone";

  }

  else {

    statusText =
      "Tilt enabled - connect BLE";
  }
}


// =====================================================
// PHONE MOTION
// =====================================================

function handleMotion(event) {

  const acceleration =
    event.accelerationIncludingGravity;


  if (
    !acceleration
  ) {

    return;
  }


  // ===================================================
  // PHONE ORIENTATION
  // ===================================================

  let angle = 0;


  if (
    screen.orientation &&
    typeof screen.orientation.angle ===
    "number"
  ) {

    angle =
      screen.orientation.angle;

  }

  else if (
    typeof window.orientation ===
    "number"
  ) {

    angle =
      window.orientation;
  }


  angle =
    (
      angle +
      360
    ) %
    360;


  let rawX = 0;

  let rawY = 0;


  // ===================================================
  // PORTRAIT
  // ===================================================

  if (
    angle === 0
  ) {

    rawX =
      acceleration.x || 0;


    rawY =
      acceleration.y || 0;
  }


  // ===================================================
  // LANDSCAPE RIGHT
  // ===================================================

  else if (
    angle === 90
  ) {

    rawX =
      acceleration.y || 0;


    rawY =
      -(acceleration.x || 0);
  }


  // ===================================================
  // UPSIDE DOWN
  // ===================================================

  else if (
    angle === 180
  ) {

    rawX =
      -(acceleration.x || 0);


    rawY =
      -(acceleration.y || 0);
  }


  // ===================================================
  // LANDSCAPE LEFT
  // ===================================================

  else {

    rawX =
      -(acceleration.y || 0);


    rawY =
      acceleration.x || 0;
  }


  // ===================================================
  // CALIBRATE STARTING POSITION
  // ===================================================

  if (
    motionBaselineX ===
    null
  ) {

    motionBaselineX =
      rawX;


    motionBaselineY =
      rawY;


    return;
  }


  // ===================================================
  // CALCULATE TILT
  // ===================================================

  const tiltX =
    rawX -
    motionBaselineX;


  const tiltY =
    rawY -
    motionBaselineY;


  debugText =
    "X: " +
    tiltX.toFixed(2) +
    "   Y: " +
    tiltY.toFixed(2);


  // ===================================================
  // MOVE BALL
  // ===================================================

  velocityX +=
    tiltX *
    tiltStrength;


  velocityY +=
    -tiltY *
    tiltStrength;
}


// =====================================================
// TARGET COLLISION
// =====================================================

function checkCollisions() {

  for (
    let i = 0;
    i < targets.length;
    i++
  ) {

    const target =
      targets[i];


    // Already triggered

    if (
      target.active
    ) {

      continue;
    }


    const distance =
      dist(
        ballX,
        ballY,
        target.x,
        target.y
      );


    if (
      distance <=
      ballRadius +
      47.5
    ) {

      // ===============================================
      // ACTIVATE TARGET
      // ===============================================

      target.active =
        true;


      const targetNumber =
        i + 1;


      statusText =
        "Target " +
        targetNumber +
        " hit";


      // ===============================================
      // BLE SERIAL
      //
      // 1 -> Channel 12
      // 2 -> Channel 13
      // 3 -> Channel 14
      // 4 -> Channel 15
      // ===============================================

      sendServoCommand(
        targetNumber
      );


      console.log(
        "TARGET:",
        targetNumber
      );
    }
  }
}


// =====================================================
// WINDOW RESIZE
// =====================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );


  ballX =
    width / 2;


  ballY =
    height / 2;


  velocityX = 0;

  velocityY = 0;


  motionBaselineX =
    null;


  motionBaselineY =
    null;


  targets[0].x =
    width * 0.20;

  targets[0].y =
    height * 0.27;


  targets[1].x =
    width * 0.80;

  targets[1].y =
    height * 0.27;


  targets[2].x =
    width * 0.20;

  targets[2].y =
    height * 0.75;


  targets[3].x =
    width * 0.80;

  targets[3].y =
    height * 0.75;


  enableButton.position(
    width / 2,
    height / 2
  );
}
