import React, { Component } from 'react';
import './App.css';

/* Each sound is rendered in a canvas, each canvas is rendered in app*/
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//only create audio context once

class Sound extends React.Component {
  constructor(props) {
    super(props);
    this.state = {play: false};
    this.init = this.init.bind(this);
    this.play = this.play.bind(this);
  }
  init(gainValue) {
    this.props.context = audioContext;
    this.props.oscillator = this.props.context.createOscillator();
    if (this.props.wave === "sine") {
      this.props.oscillator.type = "sine";
    }
    else if (this.props.wave === "sawtooth") {
      this.props.oscillator.type = "sawtooth";
    }
    else if (this.props.wave === "square") {
      this.props.oscillator.type = "square";
    }

    this.props.gainNode = this.props.context.createGain(); //gain node controls volume
    this.props.oscillator.context(this.props.gainNode); //connect oscillator to volume control
    this.props.gainNode.value = gainValue; //initialize volume to 0
    this.props.oscillator.frequency.value = 440; //set to A TODO: make frequency customizable
    this.props.oscillator.start();
    this.props.analyser = this.props.context.createAnalyser(); //analyser evaluates drawings
    this.props.gainNode.connect(this.props.analyser);
    this.props.gainNode.connect(this.props.context.destination);
  }
  draw() {

  }
  render() {
    let gainValue;
    if (!this.state.play) {
      gainValue = 0;
    }
    else {
      gainValue = 1; //TODO: make a function to customize gain
    }
    return (
      <div>
        {this.init(gainValue)}
        <canvas width="1024" height="256" onClick={() => this.handleClick()}>
          {this.draw()}
        </canvas>
      </div>
    );
  }
}

//Or: Have Sound class return init with gain value, CanvasComponent class handles drawing

class App extends Component {
  render() {
    return (
      <div className="App">
        <Sound wave="sine" />
        <Sound wave="sawtooth" />
        <Sound wave="square" />
      </div>
    );
  }
}

export default App;
