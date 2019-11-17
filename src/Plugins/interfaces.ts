import * as React from "react";

type printFunc = (val?: string, end?: string, style?: React.CSSProperties) => void;
export interface ITerminal {
  setPath: (path: string, newLine?: boolean) => void;
  setUser: (user: string, newLine?: boolean) => void;
  printJSX: (jsx: JSX.Element) => void;
  setInputValue: (val: string) => void;
  getAllCommands: () => string[];
  getInputValue: () => string;
  getUser: () => string;
  getPath: () => string;
  disableKeydownPreventDefault: () => void;
  enableKeydownPreventDefault: () => void;
  disableEnterPress: () => void;
  enableEnterPress: () => void;
  moveCursorToEnd: () => void;
  startAutoFocus: () => void;
  releaseControl: () => void;
  stopAutoFocus: () => void;
  performPrint: () => void;
  takeControl: () => void;
  printAndFlush: printFunc;
  print: printFunc;
}

export abstract class AbsTerminalPlugin {
  protected term: ITerminal;
  public commands: { [key: string]: (args: string[]) => void } = {};
  public keyedowns: {[key: string]: () => void} = {};

  public constructor(term: ITerminal) {
    this.term = term;
  }

  protected newCommand(name: string, cb: (args: string[]) => void, argsnum?: number[]): void {
    cb = cb.bind(this);
    this.commands[name] = (args: string[]) => {
      if (argsnum && !(argsnum.includes(args.length))) {
        this.term.print("Wrong number of arguments");
      } else {
        cb(args);
      }
    }
  }
}
