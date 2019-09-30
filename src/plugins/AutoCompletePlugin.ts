import {TerminalPlugin} from "./interfaces";

export class AutoCompletePlugin extends TerminalPlugin {

  private static longestCommonPrefix(strs: string[]) {
    let max = strs.reduce((s1, s2) => {
      return s1 > s2 ? s1 : s2
    });
    let min = strs.reduce((s1, s2) => {
      return s1 > s2 ? s2 : s1
    });
    let i = 0, L = min.length;
    while (i < L && min.charAt(i) === max.charAt(i))
      i++;
    return min.substring(0, i);
  }

  keyedowns = {
    Tab: () => {
      let commands = this.term.getAllCommands();
      let curr = this.term.getInputValue();
      commands = commands.filter(cmd => {
        return cmd.startsWith(curr)
      });
      if (commands.length > 0) {
        this.term.setInputValue(AutoCompletePlugin.longestCommonPrefix(commands));
      }
    }
  };
}
