import { ToolbarItem } from "../../scripts/ToolbarTypes";
import { Node } from "../file/FileTypes";

export interface Dialogue {
  parentId:string,
  comp:string,

  [key:string]:any,
}

export default interface Process {
  id:string,
  comp:string,
  name:string,
  zIndex:string,
  //onFocus?:()=>void,
  toolbar:ToolbarItem[],
  node?:Node,

  disableCloseBtn?:boolean,
  disableMinBtn?:boolean,
  disableMaxBtn?:boolean,
  isMinimized?:boolean,
  isMaximized?:boolean,
  [key:string]:any
}

export const ProcessCommands = [
  //test purpose
  "testwindow",

  //windowed
  "notepad",
  "markdown",
  "viewer", //image view
  "editor", //image editor
  "browser", //web browser
  "terminal",
  "logger",
  "finder",
  "boot-loader",
  "confirm",
  "wire",
  "atelier",
  "hub",
  "postman",
  "appstore",
  "about",
  "settings",
  "styler",
  "systeminfo",

  //daemon/app
  "broom", "savebread", "loadbread", "resetbread",
  'toolbar',
];
export function getProcessCommandsIcon(type:string){
  return ProcessCommandsIcons[type] || "/imgs/icon-default.svg";
}
export const ProcessCommandsIcons:{} = {
  //windowed
  "dir":"/imgs/dir.svg",
  "text":"/imgs/text.svg",
  "notepad":"/imgs/notepad.svg",
  "terminal":"/imgs/terminal.svg",
  "logger":"/imgs/logger.svg",
  "finder":"/imgs/finder.svg",
  "atelier":"/imgs/atelier.svg",
  "postman":"/imgs/postman.svg",
  "appstore":"/imgs/appstore.svg",
  "about":"/imgs/jamos.png",
  "settings":"/imgs/settings.svg",
  "styler":"/imgs/styler.svg",
  "systeminfo":"/imgs/chart.svg",
};

export interface Rect {
  top?: string; bottom?:string;
  left?: string; right?:string;

  width?: string;
  height?: string;
  aspectRatio?: number;
}

export type WinCb = (param?: any) => boolean;
