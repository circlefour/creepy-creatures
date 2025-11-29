import { UI, writeError, initVid } from "./modules/ui.js";
import { serialWriter } from "./modules/serial.js";
import { createFaceTracker, trackFaceState } from "./modules/tracker.js";

if (!("serial" in navigator)) {
  const error = "web serial api is not supported on this browser. please switch to chrome, edge, or opera";
  writeError(UI.errorMsg, error);
}


const arduinoSerial = serialWriter();
const faceTracker = createFaceTracker();
const faceState = trackFaceState();

let isSending = false;

const init = async () => {
  if (! await initVid()) {
    writeError(UI.errorMsg, "couldn't initialize camera. try reloading the page or something idk.");
    return;
  }
  if (! await faceTracker.initFaceDetector()) {
    writeError(UI.errorMsg, "couldn't get the face tracker working. idk rip.");
    return;
  }
  console.log('wussup. am i here?');
  faceTracker.initTracking(UI.vidElem, handleFaceDetection);
  UI.errorMsg.hidden = true;
};

// throttle helper
function throttle(fn, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

const handleFaceDetection = throttle(async (faces) => {
  if (!faces.detections.length) return;
  if (!isSending) return;

  const nose = faces.detections[0].keypoints[2];
  const maxServoAngle = 180;

  const servoX = Math.round(nose.x * maxServoAngle);
  const servoY = Math.round(nose.y * maxServoAngle);

  const msg = `${servoX},${servoY}\n`;
  await arduinoSerial.serialWrite(msg);
  console.log(msg);
}, 100);

UI.toggleTracking.addEventListener("click", async () => {
  isSending = !isSending;
  UI.toggleTracking.innerHTML = isSending ? "STOP TRACKING" : "START TRACKING";
  console.log(isSending ? "started sending to serial" : "stopped sending to serial");
});

UI.toggleVid.addEventListener("click", () => {
  UI.vidElem.hidden = !UI.vidElem.hidden;
  UI.toggleVid.innerHTML = UI.vidElem.hidden ? "SHOW VIDEO" : "HIDE VIDEO";
});

UI.connectButton.addEventListener("click", async () =>  {
  UI.connectButton.disabled = true; // to prevent user spamming
  if (!await arduinoSerial.connect()) {
    writeError(UI.errorMsg, "failed to connect to arduino. try again");
    UI.connectButton.disabled = false;
    return;
  }

  arduinoSerial.startReading((data) => {
    console.log('arduino says: ', data);
  });

  UI.connectButton.hidden = true;
  UI.lightToggle.hidden = false;
  UI.errorMsg.hidden = true;
  UI.toggleTracking.hidden = false;
});

UI.lightToggle.addEventListener("click", async () => {
  const isLightOn = UI.lightToggle.innerHTML === UI.lightStates["on"];
  const newLightState = isLightOn ? "off" : "on";
  const writeSuccess = arduinoSerial.serialWrite(newLightState + '\n');
  if (!writeSuccess) {
    writeError(UI.errorMsg, "connection lost. re-connect the arduino, refresh the page and try again.");
    return;
  }
  UI.lightToggle.innerHTML = UI.lightStates[newLightState];
  UI.errorMsg.hidden = true;
});

init();
