import {AbsTerminalPlugin} from './interfaces';

class TerminalHistory {
  private list: string[];
  private position: number = 0;
  private temp: string = "";
  constructor() {
    this.list = [];
    this.position = 0;
  }

  public back(curr: string): string {
    this.cache(curr);
    this.position = (this.position < 1) ? 0 : this.position - 1;
    return this.list[this.position] ? this.list[this.position] : curr;
  }
  public forward(curr: string): string {
    this.cache(curr);
    this.position = (this.position >= this.list.length) ? this.list.length : this.position + 1;
    return this.list[this.position] ? this.list[this.position] : this.temp;
  }

  public push(val: string) {
    if(val && val !== this.list[this.list.length -1]) {
      this.list.push(val);
    }
    this.position = this.list.length;
  }

  private cache(val: string) {
    if (this.position === this.list.length) {
      this.temp = val;
    }
  }
}

export class HistoryPlugin extends AbsTerminalPlugin {
  termhist = new TerminalHistory();
  keyedowns = {
    'Enter': () => {
      const val = this.term.getInputValue();
      this.termhist.push(val);
    },
    'ArrowUp': () => {
      this.term.setInputValue(
        this.termhist.back(
          this.term.getInputValue()
        ));
      this.term.moveCursorToEnd();
    },
    'ArrowDown': () => {
      this.term.setInputValue(
        this.termhist.forward(
          this.term.getInputValue()
        ));
      this.term.moveCursorToEnd();
    }
  }
}
