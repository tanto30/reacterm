import React, {Component} from 'react';

import Terminal, {BasePlugin} from 'reacterm';


export default class App extends Component {
  render() {
    return (
      <div className="cont">
        <Header/>
        <div id="content">
          <Sidebar/>
          <div id="sidexpand"/>
          <Terminal plugins = {[BasePlugin]}/>
        </div>
      </div>
    );
  }
}

class Sidebar extends Component {
  render() {
    return (
      <div id="sidebar">
        <a href="/">Login</a>
        <a href="/">Help</a>
        <a href="/">About</a>
      </div>
    );
  }
}
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {colapse: true};
  }


  render() {
    return (
      <div>
        <div id="header" style={{height: this.state.colapse ? 50 : 100}}></div>
        <div id="expand" onClick={() => this.setState((s) => ({colapse: !s.colapse}))}></div>
      </div>
    );
  }
}
