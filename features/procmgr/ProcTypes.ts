export default interface Process {
  id:string,
  comp:string,
  name:string,
  zIndex:string,
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
  "bakery",
  "about",
  "settings",
  "styler",
  "systeminfo",

  //daemon/app
  "broom", "savebread", "loadbread", "resetbread"
];

export interface Rect {
  top?: string; bottom?:string;
  left?: string; right?:string;

  width?: string;
  height?: string;
  aspectRatio?: number;
}

export type WinCb = (param?: any) => boolean;
