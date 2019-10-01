import React, {Component}  from 'react'

import {
  Terminal,
  BasePlugin
} from 'reacterm';

export default class App extends Component {
  render () {
    return (
      <div>
        <Terminal plugins={[
          BasePlugin
        ]}/>
      </div>
    )
  }
}
