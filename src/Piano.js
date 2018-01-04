import React, { Component } from 'react';

//https://github.com/mrcoles/javascript-piano/blob/master/audio.js
//TODO: Fix key styles, check if sound is playing
//TODO: Use the sound buffer for actual keys

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//1 ocatve from C4 to C5, including sharps
const keyStyles = {
  color: white,
  margin: 0,
  padding: 0,
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderWidth: 2,
  width: 70,
  height: 300,
  z-index: 0
};
const sharpKeyStyles = {
  color: black,
  margin: 0,
  padding: 0,
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  z-index: 1,
  position: absolute
};
const downKeyStyles = { //make div inside main key div
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.8,
  shadowRadius: 2,
  elevation: 1
};

class Sound extends React.Component {
  constructor(props) {
    super(props);
    this.play = this.play.bind(this);
    this.state = {context: audioContext,
                  frequency: null};
  }
  calculateFrequency() {
    if (!this.state.context) {
      throw "Audio Web API not supported by this browser.";
    }
    //TODO: Make a dictionary for notes
    var noteDict = {
      "C4": 261.63
    };
    if (this.props.halfStep > 0) {
      this.state.frequency = 261.63 * ((2)^(1/12))^(halfStep+1);
      //can compute the note from the number of half-steps and push to dict
    }
    else {
      this.state.frequency = 261.63; //first note is C4
    }
  }
  init() {
    this.oscillator = this.state.context.createOscillator(); //TODO: make note types customizable
    this.oscillator.type = "sine";
    this.oscillator.frequency.value = this.state.frequency;

    /* volume control initialization */
    this.oscillator.start(this.state.context.currentTime);
    this.gainNode = this.state.context.createGain(); //gain node controls volume
    this.gainNode.gain.value = 1;
    this.oscillator.connect(this.gainNode); //connect oscillator to volume control
    this.gainNode.connect(this.state.context.destination);
  }
  play() {
    if (this.props.play) {
      this.init();
    }
    else {
      this.gainNode.gain.value = 0;
    }
  }
  render() {
    return(<div={this.play} style={downKeyStyles}></div>);
  }
}

class Piano extends React.Component {
  constructor(props) {
    super(props);
    this.state = {play: true};
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e) {
    const play = e.target.value;
    this.props.onClick(play);
    /* change the state */
    const playSound = !this.state.play;
    this.setState({play: playSound});
  }
  renderNote(note, halfStep) {
    let applyStyle;
    if (note.includes("#")) {
      applyStyle = sharpKeyStyles;
    }
    else {
      applyStyle = keyStyles;
    }
    return ( /*TODO: change to onKeyDown and mouseTrigger event*/
      <div style={applyStyle} onClick={this.handleClick}>
        <Sound halfStep={halfStep} play={this.state.play}/>
        <h2>{note}</h2>
      </div>
    );
  }
  renderKeys() {
    var notes = ["C","C#","D","D#","E","F","F#","G","G#","A","B"];
    var i = 0;
    for (i; i<11; i++) {
      this.renderNote(notes[i],i);
    }
  }
  render() {
    return (
      <div>
        {this.renderKeys}
      </div>
    );
  }
}

class PianoContainer extends React.Component {
  render() {
    return(
      <Piano />
    );
  }
}

export default PianoContainer;
