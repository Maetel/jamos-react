import Path from "./Path";

export class Node {
  public id: string;
  public exeCmd: string;
  public iconPath: string;
  public args : {} = {};
  public static fromString(str: string) {
    const parsed = JSON.parse(str);
    return new Node(new Path(parsed.path), parsed.type)
      .setCmd(parsed.exeCmd)
      .setIconPath(parsed.iconPath);
  }
  public toString = (): string => {
    return JSON.stringify({
      path: this.path.path,
      type: this.type,
      exeCmd: this.exeCmd,
      iconPath: this.iconPath,
    });
  };
  constructor(public path: Path, public type: string) {
    this.id = type + path.path;
    this.exeCmd = this._setDefaultCmd(path, type);
    this.iconPath = this._setDefaultIcon(type);
  }
  public setCmd(cmd: string, args?:{}) {
    this.exeCmd = cmd;
    if(args){this.setArgs(args)};
    return this;
  }
  public setArgs(args:{}){
    this.args = {...args};
    return this;
  }
  public setIconPath(path: string) {
    this.iconPath = path;
    return this;
  }
  private _setDefaultIcon(type: string) {
    let retval = "/imgs/icon-default.svg";
    switch (type) {
      case "text":
      case "dir":
      case "terminal":
      case "logger":
      case "broom":
      case "postman":
      case "atelier":
      case "notepad":
      case "bakery":
      case "savebread":
      case "styler":
      case "loadbread":
      case "finder":
      case "settings":
        retval = `/imgs/${type}.svg`;
        break;
      case "about":
      case "hub":
        retval = "/imgs/jamos256.png";
        break;
      case "resetbread":
        retval = "/imgs/loading.svg";
        break;

      case "image":
      default:
        break;
    }
    return retval;
  }
  private _setDefaultCmd(path: Path, type: string): string {
    let retval = type;
    switch (type) {
      case "dir":
        retval = `finder ${path.path}`;
        break;
      case "text":
        retval = `notepad ${path.path}`;
        break;
      case "image":
        retval = `viewer ${path.path}`;
        break;
    }
    return retval;
  }
  isSame(rhs: Node) {
    return this.id === rhs.id;
  }

  get parent() {
    return this.path.parent;
  }
}

export interface FileData {
  params?: {};
  content?: {};
}
export interface File {
  node: Node;
  data: FileData;
}

export interface Dir {
  node: Node;
  dirs: Dir[];
  files: File[];
}

export interface DirInfo {
  totalDirs: number;
  totalFiles: number;
  curDirs: number;
  curFiles: number;
}

export function filesInDirectory(dir: Dir): DirInfo {
  const dirCount = dir.dirs.length;
  const fileCount = dir.files.length;
  return {
    totalDirs:
      dirCount +
      dir.dirs.reduce((prev, cur) => {
        return prev + filesInDirectory(cur).totalDirs;
      }, 0),
    totalFiles:
      fileCount +
      dir.dirs.reduce((prev, cur) => {
        return prev + filesInDirectory(cur).totalFiles;
      }, 0),
    curDirs: dirCount,
    curFiles: fileCount,
  };
}
export function FileToString(file: File): string {
  return JSON.stringify({
    node: file.node.toString(),
    data: JSON.stringify(file.data),
  });
}
export function StringToFile(str: string): File {
  const parsed = JSON.parse(str);
  const file = <File>{
    node: Node.fromString(parsed.node),
    data: parsed.data ? JSON.parse(parsed.data) : {},
  };
  return file;
}
