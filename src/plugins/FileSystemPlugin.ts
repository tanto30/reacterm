import {ITerminal, AbsTerminalPlugin} from "./interfaces";

type FileTree = {[key: string]: FileTree | string};
type RootFileTree = {'/': FileTree};
export class FileSystemPlugin extends AbsTerminalPlugin {
  private data: RootFileTree = {'/': {}};
  private cwd: string = '/';

  constructor(term: ITerminal) {
    super(term);
    this.term.setPath(this.cwd);
    this.newCommand('ls',  this.ls, [0,1]);
    this.newCommand('mkdir', this.mkdir, [1]);
    this.newCommand('cd', this.cd, [1]);
    this.newCommand('rm', this.rm, [1]);
    this.newCommand('touch', this.touch, [1,2]);
    this.newCommand('cat', this.cat, [1]);
  }

  private static isDir(inode: FileTree | string): inode is FileTree {
    return typeof(inode) !== "string";
  }

  private resolve(abspath: string) {
    abspath = abspath.startsWith('/') ? abspath : this.cwd + abspath;
    abspath = abspath.slice(1);
    let currdata: FileTree = this.data['/'];
    for (const dname of abspath.split('/')) {
      if (dname === '') { continue; }
      if (dname in currdata) {
        let temp : FileTree | string = currdata[dname];
        if (FileSystemPlugin.isDir(temp))
          currdata = temp;
      } else {
        throw new Error('Directory Does Not Exist');
      }
    }
    return currdata;
  }

  private isResolved(abspath: string) {
    try {
      this.resolve(abspath)
    } catch (e) {
      this.term.print(e.toString());
      return false;
    }
    return true;
  }

  ls(args:string[]): void {
    try {
      this.term.print(Object.keys(this.resolve(args[0] ? args[0]: '')).join(' '));
    } catch (e) {
      this.term.print(e.toString())
    }
  };

  mkdir(args:string[]): void {
    this.resolve(this.cwd)[args[0]] = {};
    this.term.print('');
  }

  cd(args: string[]): void {
    if (args[0] === '..') {
      if (this.cwd === '/') return;
      let index = this.cwd.slice(0,-1).lastIndexOf('/');
      this.cwd = this.cwd.slice(0, index) + '/';
      this.term.setPath(this.cwd, true);
    } else if (this.isResolved(args[0])) {
      this.cwd = (args[0].startsWith('/') ? args[0] : this.cwd + args[0]) + '/';
      this.term.setPath(this.cwd, true);
    }
  }

  rm(args: string[]): void {
    delete this.resolve(this.cwd)[args[0]];
    this.term.print('');
  }

  touch(args: string[]): void {
    this.resolve(this.cwd)[args[0]] = args[1] ? args[1] : '';
    this.term.print('');
  }

  cat(args: string[]): void {
    let inode = this.resolve(this.cwd)[args[0]];
    if (FileSystemPlugin.isDir(inode)) {
      this.term.print('Not A File');
    } else {
      this.term.print(inode);
    }

  }
}
