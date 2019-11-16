import * as React from 'react';
import "./styles.css";
import {AbsTerminalPlugin, ITerminal} from "./Plugins";

export type ConsoleProps = {
  plugins: ITerminalPluginClass[]
};
type ConsoleState = {
  inputValue: string,
  ioData: JSX.Element[],
  flushedIndex: number
  pluginTookControl: boolean,
  user: string,
  path: string
};
type ITerminalPluginClass = new (term: ITerminal) => AbsTerminalPlugin;

export class Terminal extends React.Component<ConsoleProps, ConsoleState> implements ITerminal {
  private disableEnter: boolean = false;
  private disableKeydownPD = false;
  private pluginsInUse: AbsTerminalPlugin[] = [];
  private keydownHandlers: { [key: string]: (() => void)[] } = {};
  private commandHandlers: { [key: string]: ((args: string[]) => void)[] } = {};
  private container: HTMLDivElement | null;
  private inputElement: HTMLInputElement | null;

  constructor(props: ConsoleProps) {
    super(props);
    this.state = {flushedIndex: 0, inputValue: '', ioData: [], user: '', path: '', pluginTookControl: false};
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
    let jsx = <span style={style} key={this.state.ioData.length}>{val + end}</span>;
    this.setState(prev => ({
      ioData: [...prev.ioData, jsx]
    }));
    this.ScrollToBottom();
  }

  public printJSX(jsx: JSX.Element) {
    let j = <div key={this.state.ioData.length}>{jsx}</div>;
    this.setState(prev => ({
      ioData: [...prev.ioData, j]
    }));
    this.ScrollToBottom();
  }

  public performPrint() {
    this.setState(prev => ({
        inputValue: '',
      flushedIndex: prev.ioData.length
      }));
    this.ScrollToBottom();
  }

  public moveCursorToEnd() {
    setTimeout(() => {
      if (this.inputElement)
        this.inputElement.setSelectionRange(10000, 10000)
    }, 0);
  }

  public getAllCommands() {
    const commands = Object.keys(this.commandHandlers);
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
    this.disableKeydownPreventDefault();
  }

  public releaseControl() {
    this.setState({pluginTookControl: false});
    this.performPrint();
    this.enableEnterPress();
    this._documentClickHandler();
    this.enableKeydownPreventDefault();
  }

  public getPath() {
    return this.state.path;
  }

  public setPath(path: string, newLine = true) {
    if (newLine) {
      this.performPrint();
    }
    this.setState({
      path: path
    });
  }

  public getUser() {
    return this.state.user;
  }

  public setUser(user: string, newLine = true) {
    if (newLine) {
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

  public disableEnterPress() {
    this.disableEnter = true;
  }

  public enableEnterPress() {
    this.disableEnter = false;
  }

  public enableKeydownPreventDefault() {
    this.disableKeydownPD = false;
  }

  public disableKeydownPreventDefault() {
    this.disableKeydownPD = true;
  }


  componentDidMount(): void {
    document.addEventListener('keydown', this.keyDownHandler);
    this.startAutoFocus();
    this.RegisterPlugins();
  }

  render() {
    const paneldata = this.state.ioData.map((o, i) => {
      return (
        <div className={"Console-ioline" + (this.state.flushedIndex < i ? '' : ' Console-disabled')} key={i}>{o}</div>
      )
    });
    return (
      <div className="Console-container">
        <div className="Console-iopanel">
          {paneldata}
        </div>
        <div className="Console-inputline" ref={el => {this.container = el}}>
          {this.state.pluginTookControl ? null :
            [<span key={0}>{this.getPrompt()}</span>,
              <input key={1}
                ref={el => {
                  this.inputElement = el
                }}
                className={"Console-inputelement"}
                autoFocus={true}
                autoComplete="off"
                value={this.state.inputValue}
                onChange={e => this.setState({inputValue: e.target.value})}/>]
          }
        </div>
      </div>
    );
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
      if (!this.disableKeydownPD) {
        e.preventDefault();
      }
      handlers.forEach((f) => {
        f();
      });
    }
  };

  private RegisterPlugins(): void {
    this.commandHandlers[''] = [
      () => {
      }
    ];
    this.keydownHandlers['Enter'] = [
      () => {
        this.print(this.getPrompt() + this.getInputValue());
        const [cmd, ...args] = this.getInputValue().split(' ');
        if (this.commandHandlers.hasOwnProperty(cmd)) {
          const handlers = this.commandHandlers[cmd];
          handlers.forEach((f) => {
            f(args);
          })
        } else if (cmd.length == 0) {
          if (this.commandHandlers.hasOwnProperty('_Empty'))
            this.commandHandlers['_Empty'].forEach((f) => f(args));
          this.commandHandlers[''].forEach((f) => f(args));
        } else if (this.commandHandlers.hasOwnProperty('_Default')) {
          this.commandHandlers['_Default'].forEach((f) => f(args));
        }
        if (!this.state.pluginTookControl) {
          this.performPrint();
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
          if (this.commandHandlers.hasOwnProperty(command)) {
            this.commandHandlers[command].push(instance.commands[command]);
          } else {
            this.commandHandlers[command] = [instance.commands[command]];
          }
        }
      }
    });
  }

  private _documentClickHandler = () => {
    if (this.inputElement)
      this.inputElement.focus();
  };

  private getPrompt() {
    return this.state.user + '@WEB:' + this.state.path + '> ';
  }
}

export default Terminal;
