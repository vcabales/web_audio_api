
import React, { Component } from 'react';
import './App.css';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//only create audio context once
//TODO: Fix weird startup error, add prettier visualizations

/* make canvas continuously draw, regardless of sound */
class CanvasComponent extends React.Component {
    constructor(props) {
      super(props);
      this.draw = this.draw.bind(this);
    }
    componentDidMount() { //only called one time, after the HTML is
      this.updateCanvas();
    }
    componentWillReceiveProps(nextProps) { //might not need to be in componentWillReceiveProps
    if (!this._drawVisual) { //initialize requestAnimationFrame
      this._drawVisual = window.requestAnimationFrame(this.draw); //draws automatically, resets every 60 frames
      }
    }
    updateCanvas() {
      this.canvasContext = this.refs.canvas.getContext('2d');
      this.canvasContext.fillStyle = 'rgb(200,200,200)';
      this.canvasContext.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
    }
    draw() {
      this.props.analyser.fftSize = 2048;
      this.bufferLength = this.props.analyser.frequencyBinCount; //TODO: move to draw function so it recalculates
      this.dataArray = new Uint8Array(this.bufferLength);
      this.props.analyser.getByteTimeDomainData(this.dataArray);
      this.updateCanvas(); //clear canvas before drawing
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
      //set up next iteration of loop
      this._drawVisual = window.requestAnimationFrame(this.draw);
    }
    render() {
        return (
            <div>
              <canvas ref="canvas" width={300} height={256}/>
            </div>
        );
    }
}

class Sound extends React.Component {
  constructor(props) {
    super(props);
    this.play = this.play.bind(this);
    this.state = {play: true,
                  context: audioContext};
  }
  componentWillReceiveProps(nextProps) { //if frequency or wave type change
    this.oscillator.frequency.value = this.props.frequency;
    this.setWave();
  }
  init() {
    if (!this.state.context) {
      throw "Audio Web API not supported by this browser.";
    }

    /* oscillator initialization */
    this.oscillator = this.state.context.createOscillator();
    this.setWave();
    this.oscillator.frequency.value = this.props.frequency; //set to A TODO: make frequency customizable

    /* volume control initialization */
    this.oscillator.start(this.state.context.currentTime);
    this.gainNode = this.state.context.createGain(); //gain node controls volume
    this.gainNode.gain.value = 1;
    this.oscillator.connect(this.gainNode); //connect oscillator to volume control
    this.gainNode.connect(this.state.context.destination);

    this.analyser = this.state.context.createAnalyser(); //analyser evaluates drawings
    this.analyserInit = true;
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.state.context.destination);

  }
  setWave() {
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
  }
  play() {
    const playSound = !this.state.play;
    this.setState({play: playSound});
    if (this.state.play === true) { //state is just set on first click
      this.init();
    }
    else {
      this.gainNode.gain.value = 0;
    }
  }
  render() {
    return (
        <div>
          <CanvasComponent analyser={this.analyser} init={this.analyserInit}/>
          <PlayButton play={this.state.play} onClick={this.play}/>
        </div>
    );
  }
}

class PlayButton extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e) {
    const play = e.target.value;
    this.props.onClick(play); /* update prop for child component */
  }
  render() {
    return(
      <button onClick={this.handleClick}>Play/Pause</button>
    );
  }
}

class Wave extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wave: 'sine',
      frequency: 440
  }; //default to sine wave
    this.changeWave = this.changeWave.bind(this);
    this.changeFrequency = this.changeFrequency.bind(this);
  }
  changeWave(newWave) {
    this.setState({wave: newWave});
  }
  changeFrequency(newFrequency) {
    this.setState({frequency: newFrequency});
  }
  render() {

    return(
      <div>
        <Sound wave={this.state.wave} frequency={this.state.frequency}/>
        <WaveContainer onChange={this.changeWave}/>
        <SliderContainer onChange={this.changeFrequency} freq={this.state.frequency}/>
      </div>
    );
  }
}

class WaveContainer extends React.Component { //handles change
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    const wave = e.target.value;
    this.props.onChange(wave);
  }
  render() {
    return(
      <div>
        <select onChange={this.handleChange}>
          <option value="sine">sine</option>
          <option value="sawtooth">sawtooth</option>
          <option value="square">square</option>
          <option value="triangle">triangle</option>
        </select>
      </div>
    );
  }
}

class SliderContainer extends React.Component { //control frequency range
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  componentDidMount() {
    this.slider = this.refs.input;
  }
  handleChange(e) {
    const frequency = e.target.value;
    this.props.onChange(frequency);
  }
  render() {
    return(
      <div>
        <input onChange={this.handleChange} type="range" min="16" max="7903" defaultValue="440" className="slider" id="myRange" />
        <h1>Frequency: {this.props.freq}</h1>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div>
        <Wave />
      </div>
    );
  }
}

export default App;
