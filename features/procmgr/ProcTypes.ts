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

  //daemon/app
  "broom", "savebread", "loadbread", "resetbread"
];

export interface Theme {
  name: string;
  colors: { [key: string]: string };
  nav: string; //define 'string : component' map at Window.svelte
}

export interface Rect {
  top?: string; bottom?:string;
  left?: string; right?:string;

  width?: string;
  height?: string;
  aspectRatio?: number;
}
export type WinCb = (param?: any) => boolean;
export interface WinCbs {
  closeWindow?: WinCb;
  onFocus?: WinCb;
  confirmClose?: WinCb;
  onMaximizeStart?: WinCb;
  onMaximizeFinish?: WinCb;
  onMount?: WinCb;
  onDestroy?: WinCb;
  setWindowRect?: WinCb;
  setWindowPrevRect?: WinCb;
  onWindowRectFinish?: WinCb;
  [key: string]: WinCb;
}