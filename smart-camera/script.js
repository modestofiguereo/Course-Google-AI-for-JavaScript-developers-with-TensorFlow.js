(async () => {
  let model = null;
  let children = [];

  await init();

  async function init() {
    if (isUserMediaSupported()) {
      const webcamButton = document.getElementById('webcamButton');
      webcamButton.addEventListener('click', enableCam);
    }
    else {
      console.warn('getUserMedia() is not supported by your browser');
    }

    model = await cocoSsd.load();
    onModelLoad();
  }

  function isUserMediaSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  function onModelLoad() {
    const demos = document.getElementById('demos');
    demos.classList.remove('invisible');
  }

  async function enableCam(event) {
    if (!model) return;

    event.target.classList.add('removed');

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 960 },
        height: { ideal: 512 }
      }
    });

    const video = document.getElementById('webcam');

    video.srcObject = stream;
    video.addEventListener('loadeddata', onPredictWebcam);
  }

  async function onPredictWebcam(event) {
    const { target: video } = event;
    const liveView = document.getElementById('liveView');
    const predictions = await model.detect(video);

    cleanPreviousHighlights()

    for (let n = 0; n < predictions.length; n++) {
      if (predictions[n].score > 0.66) {
        createHighLight(predictions[n], video, liveView);
      }
    }

    window.requestAnimationFrame(() => {
      onPredictWebcam(event);
    });
  }

  function cleanPreviousHighlights() {
    const liveView = document.getElementById('liveView');
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }

    children.splice(0);
  }

  function createHighLight(prediction, video, liveView) {
    const left = prediction.bbox[0];
    const top = prediction.bbox[1];
    const width = prediction.bbox[2];
    const height = prediction.bbox[3];

    // notice: the videos is flipped horizontally so that the images look like a mirror.
    const flippedLeft = video.offsetWidth - left - width;

    const p = createLabel({ class: prediction.class, score: prediction.score, flippedLeft, top, width });
    const highlighter = createBox({ flippedLeft, top, width, height });

    liveView.appendChild(highlighter);
    liveView.appendChild(p);
    children.push(highlighter);
    children.push(p);
  }

  function createLabel({ class: predictedClass, score, flippedLeft, top, width }) {
    const p = document.createElement('p');
    p.innerText = `${predictedClass} - with ${Math.round(parseFloat(score) * 100)}% confidence.`;
    p.style = `
      margin-left: ${flippedLeft}px; 
      margin-top: ${top - 10}px; 
      width: ${width - 10}px; 
      top: 0; 
      left: 0;
    `;

    return p;
  }

  function createBox({ flippedLeft, top, width, height }) {
    const highlighter = document.createElement('div');
    highlighter.setAttribute('class', 'highlighter');
    highlighter.style = `
      left: ${flippedLeft}px; 
      top: ${top}px; 
      width: ${width}px; 
      height: ${height}px;
    `;

    return highlighter;
  }
})()
