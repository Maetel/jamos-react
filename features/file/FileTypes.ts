import Path from "../../scripts/Path";
import Log from "../log/Log";

export interface Node {
  id: string,
  path:string,
  type:string,
  exeCmd: string,
  iconPath: string,
}

export class NodeControl {
  public static build(path:string, type:string, exeCmd?:string, iconPath?:string, data?:{}) {
    return {
      id :type + path,
      path:path,
      type:type,
      exeCmd:exeCmd ?? this._setDefaultCmd(new Path(path), type),
      iconPath : iconPath ?? this._setDefaultIcon(type),
      data: data ?? {},
    }
  }

  public static fromString(str: string) {
    try {
      return <Node>JSON.parse(str)
    } catch (error) {
      Log.error(error);
      return undefined;
    }
  } 
  public static toString = (node:Node): string => {
    return JSON.stringify(node);
  };
  
  private static _setDefaultIcon(type: string) {
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
  private static _setDefaultCmd(path: Path, type: string): string {
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
  public static isSame(lhs:Node, rhs: Node) {
    return lhs.id === rhs.id;
  }

} //!Node

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
    node: NodeControl.fromString(parsed.node),
    data: parsed.data ? JSON.parse(parsed.data) : {},
  };
  return file;
}
