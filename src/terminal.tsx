import * as React from 'react';
import "./styles.css";
import {ITerminal, TerminalPlugin} from "./plugins";

export type ConsoleProps = {
  plugins: ITerminalPluginClass[]
};
export type ConsoleState = {
  inputValue: string,
  ioData: { in: string, out: string[] }[],
  user: string,
  path: string
};
type ITerminalPluginClass = new (term: ITerminal) => TerminalPlugin;

class Terminal extends React.Component<ConsoleProps, ConsoleState> implements ITerminal {
  private pluginsInUse: TerminalPlugin[] = [];
  private keydownHandlers: { [key: string]: (() => void)[] } = {};
  private commandHanlers: { [key: string]: ((args: string[]) => void)[] } = {};
  private printAggregation: string[] = [];

  constructor(props: ConsoleProps) {
    super(props);
    this.state = {inputValue: '', ioData: [], user: '', path: ''};
  }

  public getInputValue() {
    return this.state.inputValue;
  }

  public setInputValue(val: string) {
    this.setState({inputValue: val});
  }

  public print(val: string) {
    this.printAggregation.push(val);
  }

  public performPrint() {
    if (this.printAggregation.length > 0) {
      this.setState(prev => ({
        inputValue: '',
        ioData: [...prev.ioData, {in: this.getPrompt() + prev.inputValue, out: this.printAggregation.slice()}]
      }));
      this.printAggregation = [];
    }
  }

  public moveCursorToEnd() {
    const ie = document.getElementById('Console-inputelement') as HTMLInputElement;
    setTimeout(() => {
      ie.setSelectionRange(10000, 10000)
    }, 0);
  }

  public getAllCommands() {
    const commands = Object.keys(this.commandHanlers);
    commands.splice(commands.indexOf('_Default'), 1);
    return commands;
  }

  getPath() {
    return this.state.path;
  }

  setPath(path: string, newLine?: boolean) {
    if (newLine) {
      this.print('');
      this.performPrint();
    }
    this.setState(() => ({
      path: path
    }));
  }

  getUser() {
    return this.state.user;
  }

  setUser(user: string, newLine?: boolean) {
    if (newLine) {
      this.print('');
      this.performPrint();
    }
    this.setState({user: user});
  }

  private keyDownHandler = (e: KeyboardEvent) => {
    if (this.keydownHandlers.hasOwnProperty(e.key)) {
      const handlers = this.keydownHandlers[e.key];
      e.preventDefault();
      handlers.forEach((f) => {
        f();
      });
    }
    this.performPrint();
  };

  private RegisterPlugins(): void {
    this.keydownHandlers['Enter'] = [() => {
      const [cmd, ...args] = this.getInputValue().split(' ');
      if (this.commandHanlers.hasOwnProperty(cmd)) {
        const handlers = this.commandHanlers[cmd];
        handlers.forEach((f) => {
          f(args);
        })
      } else if (this.commandHanlers.hasOwnProperty('_Default')) {
        this.commandHanlers['_Default'].forEach((f) => {
          f(args);
        })
      }
    }
    ];
    this.props.plugins.forEach((plugin) => {
      const instance = new plugin(this);
      this.pluginsInUse.push(instance);
      for (let keyname in instance.keyedowns) {
        if (instance.keyedowns.hasOwnProperty(keyname)) {
          if (this.keydownHandlers.hasOwnProperty(keyname)) {
            this.keydownHandlers[keyname].push(instance.keyedowns[keyname]);
          } else {
            this.keydownHandlers[keyname] = [instance.keyedowns[keyname]];
          }
        }
      }
      for (let command in instance.commands) {
        if (instance.commands.hasOwnProperty(command)) {
          if (this.commandHanlers.hasOwnProperty(command)) {
            this.commandHanlers[command].push(instance.commands[command]);
          } else {
            this.commandHanlers[command] = [instance.commands[command]];
          }
        }
      }
    });
  }

  componentDidMount(): void {
    document.addEventListener('keydown', this.keyDownHandler);
    document.addEventListener('click', () => {
      const ie = document.getElementById('Console-inputelement');
      if (ie) {
        ie.focus();
      }
    });
    this.RegisterPlugins();
  }

  private getPrompt() {
    return this.state.user + '@WEB:' + this.state.path + '> ';
  }

  render() {
    const paneldata = this.state.ioData.map((o, i) => {
      const outdata = o.out.map((v, i) => {
        return (<div key={i}>{v}</div>);
      });
      return (
        <div className="Console-ioline" key={i}>
          <div>{o.in}</div>
          <div className="Console-output">{outdata}</div>
        </div>
      )
    });
    return (
      <div className="Console-container">
        <div className="Console-iopanel">
          {paneldata}
        </div>
        <div className="Console-inputline">
          {this.getPrompt()}
          <input id="Console-inputelement"
                 autoFocus={true}
                 autoComplete="off"
                 value={this.state.inputValue}
                 onChange={e => this.setState({inputValue: e.target.value})}/>
        </div>
      </div>
    );
  }
}

export default Terminal;
