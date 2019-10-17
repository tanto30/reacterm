import React, {Component}  from 'react'

import {
  Terminal,
  BasePlugin
} from 'reacterm';

export default class App extends Component {
  render () {
    return (
      <div className="cont">
        <Header/>
        <Terminal plugins = {[BasePlugin]}/>
      </div>
      
    )
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
        <div id="expand" onClick={e => this.setState(s => ({colapse: !s.colapse}))}>{this.state.colapse ? 'expand' : 'collapse'}</div>
      </div>
    )
  }
}
