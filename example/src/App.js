import React, {Component}  from 'react'

import {Terminal} from 'react-terminal';

export default class App extends Component {
  render () {
    return (
      <div>
        <Terminal plugins={[]}/>
      </div>
    )
  }
}
