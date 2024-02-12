(async () => {

  const ids = ['webcam', 'liveView', 'demos', 'webcamButton'];
  const [video, liveView, demos, webcamButton] = ids.map(id => document.getElementById(id));

  function isUserMediaSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  function predictWebcam() { }

  async function enableCam(event) {
    if (!model) return;

    event.target.classList.add('removed');

    const constraints = {
      video: true,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  }

  if (isUserMediaSupported()) {
    webcamButton.addEventListener('click', enableCam);
  }
  else {
    console.warn('getUserMedia() is not supported by your browser');
  }

  // Pretend model has loaded so we can try out the webcam code.
  // TODO: remove
  var model = true;
  demos.classList.remove('invisible');
})()
