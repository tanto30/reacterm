import * as React from 'react';
import "./styles.css";
import {ITerminal, AbsTerminalPlugin} from "./plugins";

export type ConsoleProps = {
  plugins: ITerminalPluginClass[]
};
type ConsoleState = {
  inputValue: string,
  ioData: { in: string, out: JSX.Element[] }[],
  printAggregation: JSX.Element[],
  pluginTookControl: boolean,
  user: string,
  path: string
};
type ITerminalPluginClass = new (term: ITerminal) => AbsTerminalPlugin;

class Terminal extends React.Component<ConsoleProps, ConsoleState> implements ITerminal {
  private disableEnter: boolean = false;
  private pluginsInUse: AbsTerminalPlugin[] = [];
  private keydownHandlers: { [key: string]: (() => void)[] } = {};
  private commandHanlers: { [key: string]: ((args: string[]) => void)[] } = {};
  private container: HTMLDivElement | null;

  constructor(props: ConsoleProps) {
    super(props);
    this.state = {inputValue: '', ioData: [], user: '', path: '', printAggregation: [], pluginTookControl: false};
  }

  public getInputValue() {
    return this.state.inputValue;
  }

  public setInputValue(val: string) {
    this.setState({inputValue: val});
  }

  public print(val = '', end = '\n', style = {}) {
    if (val === '' && end === '\n')
      end = '';
    let jsx = <span style={style} key={this.state.printAggregation.length}>{val + end}</span>;
    this.setState(prev => ({
      printAggregation: [...prev.printAggregation, jsx]
    }));
    this.ScrollToBottom();
  }

  public printJSX(jsx: JSX.Element) {
    let j = <div key={this.state.printAggregation.length}>{jsx}</div>;
    this.setState(prev => ({
      printAggregation: [...prev.printAggregation, j]
    }));
    this.ScrollToBottom();
  }

  public performPrint() {
    if (this.state.printAggregation.length > 0) {
      this.setState(prev => ({
        inputValue: '',
        ioData: [...prev.ioData, {in: this.getPrompt() + prev.inputValue, out: prev.printAggregation}],
        printAggregation: []
      }));
    }
    this.ScrollToBottom();
  }

  public moveCursorToEnd() {
    const ie = document.getElementById('Console-inputelement') as HTMLInputElement;
    setTimeout(() => {
      ie.setSelectionRange(10000, 10000)
    }, 0);
  }

  public getAllCommands() {
    const commands = Object.keys(this.commandHanlers);
    let di, ei, emi;
    di = commands.indexOf('_Default');
    ei = commands.indexOf('_Empty');
    emi = commands.indexOf('');
    if (di != -1) commands.splice(di, 1);
    if (ei != -1) commands.splice(ei, 1);
    if (emi != -1) commands.splice(emi, 1);
    return commands;
  }

  public takeControl() {
    this.setState({pluginTookControl: true});
    this.disableEnterPress();
  }

  public releaseControl() {
    this.setState({pluginTookControl: false});
    this.performPrint();
    this.enableEnterPress();
  }

  public getPath() {
    return this.state.path;
  }

  public setPath(path: string, newLine?: boolean) {
    if (newLine) {
      this.print('');
      this.performPrint();
    }
    this.setState({
      path: path
    });
  }

  public getUser() {
    return this.state.user;
  }

  public setUser(user: string, newLine?: boolean) {
    if (newLine) {
      this.print('');
      this.performPrint();
    }
    this.setState({
      user: user
    });
  }

  public printAndFlush(val: string) {
    this.print(val);
    this.performPrint();
  }

  public startAutoFocus() {
    document.addEventListener('click', this._documentClickHandler);
  }

  public stopAutoFocus() {
    document.removeEventListener('click', this._documentClickHandler);
  }

  private ScrollToBottom() {
    if (this.container)
    this.container.scrollIntoView({behavior: 'smooth'});
  }

  private keyDownHandler = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && this.disableEnter)
      return;
    if (this.keydownHandlers.hasOwnProperty(e.key)) {
      const handlers = this.keydownHandlers[e.key];
      e.preventDefault();
      handlers.forEach((f) => {
        f();
      });
    }
  };

  public disableEnterPress() {
    this.disableEnter = true;
  }

  public enableEnterPress() {
    this.disableEnter = false;
  }

  private RegisterPlugins(): void {
    this.commandHanlers[''] = [
      () => {
        this.print();
      }
    ];
    this.keydownHandlers['Enter'] = [
        () => {
        const [cmd, ...args] = this.getInputValue().split(' ');
        if (this.commandHanlers.hasOwnProperty(cmd)) {
          const handlers = this.commandHanlers[cmd];
          handlers.forEach((f) => {
            f(args);
          })
        } else if (cmd.length == 0) {
          if (this.commandHanlers.hasOwnProperty('_Empty'))
            this.commandHanlers['_Empty'].forEach((f) => f(args));
          this.commandHanlers[''].forEach((f) => f(args));
        } else if (this.commandHanlers.hasOwnProperty('_Default')) {
          this.commandHanlers['_Default'].forEach((f) => f(args));
        }
          if (!this.state.pluginTookControl)
            this.performPrint();
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

  private _documentClickHandler() {
    const ie = document.getElementById('Console-inputelement');
    if (ie)
      ie.focus();
  }

  componentDidMount(): void {
    document.addEventListener('keydown', this.keyDownHandler);
    this.startAutoFocus();
    this.RegisterPlugins();
  }

  private getPrompt() {
    return this.state.user + '@WEB:' + this.state.path + '> ';
  }

  render() {
    const paneldata = this.state.ioData.map((o, i) => {
      return (
        <div className="Console-ioline" key={i}>
          <div className="Console-input">{o.in}</div>
          <div className="Console-output">{o.out}</div>
        </div>
      )
    });
    return (
      <div className="Console-container">
        <div className="Console-iopanel">
          {paneldata}
        </div>
        <div className="Console-inputline" ref={el => {this.container = el}}>
          {this.getPrompt()}
          <input id="Console-inputelement"
                 autoFocus={true}
                 autoComplete="off"
                 value={this.state.inputValue}
                 onChange={e => this.setState({inputValue: e.target.value})}
                 disabled={this.state.pluginTookControl}/>
        </div>
        <div className="Console-output">
          {this.state.printAggregation}
        </div>
      </div>
    );
  }
}

export default Terminal;
