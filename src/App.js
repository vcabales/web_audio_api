import React, { Component } from 'react';
import './App.css';

/* Each sound is rendered in a canvas, each canvas is rendered in app*/
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//only create audio context once

class Sound extends React.Component {
  constructor(props) {
    super(props);
    this.state = {play: false};
  }
  init(gainValue) {
    this.context = audioContext;
    this.oscillator = this.context.createOscillator();
    if (this.props.wave === "sine") {
      this.oscillator.type = "sine";
    }
    else if (this.props.wave === "sawtooth") {
      this.oscillator.type = "sawtooth";
    }
    else if (this.props.wave === "square") {
      this.oscillator.type = "square";
    }

    this.gainNode = this.context.createGain(); //gain node controls volume
    this.oscillator.connect(this.gainNode); //connect oscillator to volume control
    this.gainNode.value = gainValue; //initialize volume to 0
    this.oscillator.frequency.value = 440; //set to A TODO: make frequency customizable
    this.oscillator.start();
    this.analyser = this.context.createAnalyser(); //analyser evaluates drawings
    this.gainNode.connect(this.analyser);
    this.gainNode.connect(this.context.destination);
    this.analyser.fftSize = 2048;
  }
  play() {
    const playSound = !this.state.play;
    this.setState({play: playSound});
    let gainValue;
    if (!this.state.play) {
      gainValue = 0;
    }
    else {
      gainValue = 1; //TODO: make a function to customize gain
    }
    return(this.init(gainValue));
  }
  render() {
    return (
      <div className="soundInit" onClick={() => this.play}>
        <CanvasComponent analyser={this.analyser}/>
      </div>
    );
  }
}

class CanvasComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  updateCanvas() {
    this.bufferLength = this.props.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.canvasContext = this.refs.canvas.getContext('2d');
    this.canvasContext.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
    this.drawVisual = requestAnimationFrame(this.updateCanvas());
    this.props.analyser.getByteTimeDomainData(this.dataArray);
    this.canvasContext.fillStyle = 'rgb(200,200,200)';
    this.canvasContext.lineWidth = 2;
    this.canvasContext.strokeStyle = 'rgb(0,0,0)';
    this.canvasContext.beginPath();
    var sliceWidth = this.refs.canvas.width * 1.0 / this.bufferLength;
    var x=0;
    for (var i = 0; i < this.bufferLength; i++) {
      var v = this.dataArray[i] / 128.0;
      var y = v * this.refs.canvas.height / 2;
      if (i === 0) {
        this.canvasContext.moveTo(x, y);
      } else {
        this.canvasContext.lineTo(x, y);
      }
      x += sliceWidth;
    }
    this.canvasContext.lineTo(this.refs.canvas.width, this.refs.canvas.height / 2);
    this.canvasContext.stroke();

  }
  render() {
    this.updateCanvas();
    return (
      <canvas width={1024} height={256} onClick={this.props.onClick}/>
    );
  }
}

//Or: Have Sound class return init with gain value, CanvasComponent class handles drawing

class App extends Component {
  render() {

    return (
      <div className="App">
        <Sound wave="sine" />
      </div>
    );
  }
}

export default App;
