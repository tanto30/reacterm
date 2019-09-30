import {ITerminal, TerminalPlugin} from "./interfaces";

export class BasePlugin extends TerminalPlugin {
  constructor(term: ITerminal) {
    super(term);
    let funcs: Set<string> = new Set();
    let obj: any = this;
    do {
      Object.getOwnPropertyNames(obj)
      // eslint-disable-next-line no-loop-func
        .filter(p => typeof obj[p] === 'function' && p !== 'constructor')
        .forEach(p => funcs.add(p));
    } while ((obj = Object.getPrototypeOf(obj)) && obj !== TerminalPlugin.prototype);
    // @ts-ignore
    funcs.forEach(n => this.newCommand(n, this[n]));
  }

  _Default() {
    this.term.print('Command not found');
  }
  help() {
    let commands = this.term.getAllCommands();
    this.term.print(commands.join(' '));
  }
}
