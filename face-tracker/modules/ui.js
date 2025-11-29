export { writeError, UI, initVid };

const writeError = (uiElement, error) => {
  uiElement.innerHTML = error;
  uiElement.hidden = false;
};

const get = id => document.getElementById(id);

const UI = {
  lightToggle: get('light'),
  lightStates: {
    "on": "TURN LED OFF",
    "off": "TURN LED ON",
  },
  connectButton: get('connect'),
  toggleTracking: get('toggleTracking'),
  toggleVid: get('toggleCamView'),
  errorMsg: get('errorMsg'),
  vidElem: get('cam'),
};

const initVid = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    UI.vidElem.srcObject = stream;
    UI.vidElem.play();
    UI.toggleVid.hidden = false;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
