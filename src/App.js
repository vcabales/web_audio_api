import React, { Component } from 'react';
import './App.css';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//only create audio context once

class Sound extends React.Component {
  constructor(props) {
    super(props);
    this.state = {play: false};
    this.play = this.play.bind(this);
  }
  componentDidMount() {
    this.init();
  }
  init() {
    this.context = audioContext;

    /* oscillator initialization */
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
    else if (this.props.wave === "triangle") {
      this.oscillator.type = "triangle";
    }
    this.oscillator.frequency.value = 440; //set to A TODO: make frequency customizable

    /* volume control initialization */
    this.oscillator.start(0.5);
    this.gainNode = this.context.createGain(); //gain node controls volume
    this.gainNode.gain.value = 0;
    this.oscillator.connect(this.gainNode); //connect oscillator to volume control
    this.gainNode.connect(this.context.destination);

    /* Initialize analyser */
    this.analyser = this.context.createAnalyser(); //analyser evaluates drawings
    this.analyser.fftSize = 2048;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.analyser.getByteTimeDomainData(this.dataArray);
    this.gainNode.connect(this.analyser); //connect volume control to analyser

  }
  play() {
    const playSound = !this.state.play;
    this.setState({play: playSound});
  }

  render() {
    return (
      <div className="soundInit">
        <CanvasComponent bufferLength={this.bufferLength} dataArray={this.dataArray} play={this.state.play} onClick={this.play}/>
      </div>
    );
  }
}

/* make canvas continuously draw, regardless of sound */
class CanvasComponent extends React.Component {
    constructor(props) {
      super(props);
      this.draw = this.draw.bind(this);
      this.handleClick = this.handleClick.bind(this);
    }
    componentDidMount() { //only called one time, gives access to refs of component's children
      this.updateCanvas();
    }
    updateCanvas() {
      this.canvasContext = this.refs.canvas.getContext('2d');
      this.canvasContext.fillStyle = 'rgb(200,200,200)';
      this.canvasContext.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
      if (!this.drawVisual) {
        this.drawVisual = window.requestAnimationFrame(this.draw);
      }
    }
    handleClick(e) {
      const play = e.target.value;
      this.props.onClick(play); /* update prop for child component */

      if (this.props.play) {
        this.draw(); //only working on second click and not toggling?
      }
    }
    draw() {
      /*
      this.canvasContext.font = "28px Georgia";
      this.canvasContext.fillStyle = "blue";
      this.canvasContext.fillText("Testing draw function", 10, 50);
      */
      this.canvasContext.lineWidth = 2;
      this.canvasContext.strokeStyle = 'rgb(0,0,0)';
      this.canvasContext.beginPath();
      var sliceWidth = this.refs.canvas.width * 1.0 / this.props.bufferLength;
      var x=0;
      for (var i = 0; i < this.props.bufferLength; i++) {
        var v = this.props.dataArray[i] / 128.0;
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
        return (
            <div>
              <canvas ref="canvas" width={300} height={256}/>
              <button onClick={this.handleClick}>Play</button>
            </div>
        );
    }
}

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
