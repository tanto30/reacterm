export interface ITerminal {
  getInputValue: () => string;
  setInputValue: (val: string) => void;
  print: (val?: string) => void;
  moveCursorToEnd: () => void;
  getAllCommands: () => string[];
  getPath: () => string;
  setPath: (path: string, newLine?: boolean) => void;
  getUser: () => string;
  setUser: (user: string, newLine?: boolean) => void;
  performPrint: () => void;
  printAndFlush: (val: string) => void;
}

export abstract class AbsTerminalPlugin {
  protected term: ITerminal;
  public commands: {[key: string]: (args: string[]) => void} = {};
  public keyedowns: {[key: string]: () => void} = {};
  constructor(term: ITerminal) {
    this.term = term;
  }

  protected newCommand(name: string, cb: (args: string[]) => void, argsnum?: number[]): void {
    cb = cb.bind(this);
    this.commands[name] = (args: string[]) => {
      if (argsnum && !(argsnum.includes(args.length))) {
        console.log(argsnum);
        this.term.print("Wrong number of arguments");
      } else {
        cb(args);
      }
    }
  }
}
