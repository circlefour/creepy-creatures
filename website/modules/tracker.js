import { FaceDetector, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
export { createFaceTracker, trackFaceState };

const modelAssetPath = `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite`;
const wasmPath = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

const createFaceTracker = () => {
  let faceDetector = null;
  let isTracking = false;
  let animationId = null;

  const initFaceDetector = async () => {
    console.log('starting face detector init....');
    try {
      console.log('awaiting wasm path....');
      const vision = await FilesetResolver.forVisionTasks(wasmPath);
      console.log('actually creating the detector...');
      faceDetector = await FaceDetector.createFromOptions( vision, {
        baseOptions: { modelAssetPath: modelAssetPath, delegate: "GPU" },
        numFaces: 1,
        runningMode: "VIDEO"
      });
      console.log('created the detector. all looks good');
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const initTracking = (videoElement, onDetection) => {
    if (!faceDetector) {
      console.error("no face detector was created.");
      return false;
    }
    if (isTracking) {
      console.warn("tracking already happening lol");
      return false;
    }
    isTracking = true;
    let lastVideoTime = -1;

    const detectFaces = () => {
      if (!isTracking) return;

      const currentTime = videoElement.currentTime;

      if (currentTime !== lastVideoTime) {
        lastVideoTime = currentTime;

        const results = faceDetector.detectForVideo(videoElement, Date.now());

        //FIXME: check if i even need this, i think specifying 1 face in init always gives me one face anyway
        if (results && results.detections && results.detections.length > 0) {
          // sorts in order of confidence score
          const sortedDetections = results.detections.sort((faceA, faceB) =>
            (faceB.categories[0]?.score || 0) - (faceA.categories[0]?.score || 0)
          );

          onDetection({
            detections: sortedDetections,
            timestamp: Date.now()
          });
        }
      }
      animationId = requestAnimationFrame(detectFaces);
    };

    detectFaces();
    return true;
  };

  const stopTracking = () => {
    isTracking = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  const kill = () => {
    stopTracking();
    if (faceDetector) {
      faceDetector.close();
      faceDetector = null;
    }
  };

  return {
    initFaceDetector,
    initTracking,
    stopTracking,
    kill
  };
};

const trackFaceState = () => {
  let midx = null;
  let midy = null;

  const setMidpoint = (face) => {
    midx = face.boundingBox.originX + face.boundingBox.width//2;
    midy = face.boundingBox.originY + face.boundingBox.height//2;
  };

  const getMidpoint = () => {
    return {midx, midy};
  };

  return {
    setMidpoint,
    getMidpoint,
  };
};
