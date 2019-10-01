# reacterm

> React component to render a terminal with plugin based functionality

[![NPM](https://img.shields.io/npm/v/reacterm.svg)](https://www.npmjs.com/package/reacterm) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save reacterm
```

## Usage

```tsx
import * as React from 'react'

import {
  Terminal,          // Main component
  HistoryPlugin,     // History plugin to allow arrowup and arrowdown 
  FileSystemPlugin,  // FS plugin to simulate filesystem in memory (note: WIP)
  AutoCompletePlugin // Auto-complete plugin to allow tab auto completion
  BasePlugin         // Base plugin to allow 'Command not found' and help command, can be extended
  TerminalPlugin     // Base (abstract) class to define a terminal plugin
} from 'reacterm'

class Example extends React.Component {
  render () {
    return (
      <Terminal plugins={[BasePlugin, HistoryPlugin]}/>
    )
  }
}
```

## License

MIT © [tanto30](https://github.com/tanto30)
