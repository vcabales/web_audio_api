var newCanvas = document.createElement("canvas");
newCanvas.id = "oscillatorCanvas";
newCanvas.setAttribute("width", "1024px");
newCanvas.setAttribute("height", "256px");

var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
var oscillator = audioCtx.createOscillator();
oscillator.type = "sine";
oscillator.frequency.value = 440; //note
oscillator.start(1); //wait 1 sec
var gainNode = audioCtx.createGain();
gainNode.gain.value = 0; //volume
oscillator.connect(gainNode);
var analyser = audioCtx.createAnalyser();
gainNode.connect(analyser);
gainNode.connect(audioCtx.destination);

// ...Continue from here

analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);

// Get a canvas defined with ID "oscilloscope"
var canvas = document.getElementById("oscillatorCanvas");
var canvasCtx = canvas.getContext("2d");

// draw an oscilloscope of the current audio source

function draw() {

  drawVisual = requestAnimationFrame(draw);

  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.fillStyle = 'rgb(200, 200, 200)';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

  canvasCtx.beginPath();

  var sliceWidth = canvas.width * 1.0 / bufferLength;
  var x = 0;

  for (var i = 0; i < bufferLength; i++) {

    var v = dataArray[i] / 128.0;
    var y = v * canvas.height / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
};

draw();
