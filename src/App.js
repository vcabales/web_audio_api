import React, { Component } from 'react';
import './App.css';

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
    else if (this.props.wave === "triangle") {
      this.oscillator.type = "triangle";
    }

    this.gainNode = this.context.createGain(); //gain node controls volume
    this.oscillator.connect(this.gainNode); //connect oscillator to volume control
    this.gainNode.value = gainValue; //initialize volume to 0
    this.oscillator.frequency.value = 440; //set to A TODO: make frequency customizable
    this.oscillator.start();
    this.analyser = this.context.createAnalyser(); //analyser evaluates drawings
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.gainNode.connect(this.analyser);
    this.gainNode.connect(this.context.destination);
    this.analyser.fftSize = 2048;
    this.analyser.getByteTimeDomainData(this.dataArray);
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
        <CanvasComponent analyser={this.analyser} xPos="0" yPos="0" bufferLength={this.bufferLength} dataArray={this.dataArray}/>
      </div>
    );
  }
}

class CanvasComponent extends React.Component {
    componentDidMount() { //only called one time, gives access to refs of component's children
      this.updateCanvas();
    }
    updateCanvas() {
      const canvasContext = this.refs.canvas.getContext('2d');
      canvasContext.fillStyle = 'rgb(200,200,200)';
      canvasContext.fillRect(this.props.xPos, this.props.yPos, this.refs.canvas.width, this.refs.canvas.height);
    }
    draw() {
      const canvasContext = this.refs.canvas.getContext('2d');
      this.drawVisual = requestAnimationFrame(this.draw());
      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = 'rgb(0,0,0)';
      canvasContext.beginPath();
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
      canvasContext.lineTo(this.refs.canvas.width, this.refs.canvas.height / 2);
      canvasContext.stroke();
    }
    render() {
        return (
            <canvas ref="canvas" width={300} height={256}/>
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
