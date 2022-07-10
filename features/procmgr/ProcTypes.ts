import { FileDialProps } from "../../components/FileDialogue";
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
  killable?:boolean,

  style?:{[key:string]:string}, //whatever additional styles
  children?:string[], // automatically added in procSlice.addProc reducer
  parent?:string, //in case this is a child process

  //value input from modal (child) window
  // modalRetval?:string,
  // textmodalRetval?:string,
  // moveFrom?:string,
  
  //callbackIds, can be found in CallbackStore.callbacks
  onBackgroundClick?:string,
  beginBlink?:boolean,
  endBlink?:boolean,

  //window options
  hideNav?:boolean,
  hideNavButtons?:boolean,
  hideOnDock?:boolean,
  disableBackground?:boolean,
  opaqueBackground?:boolean,
  closeOnBackgroundClick?:boolean,
  disableDrag?:boolean,
  disableCloseBtn?:boolean,
  disableMinBtn?:boolean,
  disableMaxBtn?:boolean,
  isMinimized?:boolean,
  isMaximized?:boolean,
  resize? : 'both' | 'none',

  //auto-generated
  hovered?:number,
  inputValue?:string,
  fileDial?:string,
  focusIdx?:number,
  blinkIntervalId?:boolean, //auto-generated by beginBlink
  currentPath?:string,
  textAreaValue?:string,
  imageIdx:number,

  [key:string]:any
}

export function getProcessCommandsIcon(type:string){
  return _ProcessCommands.find(cmd=>cmd.comp===type)?.icon ?? "/imgs/icon-default.svg";
}
export interface Rect {
  top?: string; bottom?:string;
  left?: string; right?:string;

  width?: string;
  height?: string;
  aspectRatio?: number;
}


export interface ProcessCommand {
  comp:string,
  type?:'window'|'daemon'|'system', // if undefined, 'window'. 'system' cannot be called manually
  icon?:string, // if undefined, "/imgs/icon-default.svg"
  runOnce?:boolean, // if undefined, false
}

export const _ProcessCommands:ProcessCommand[] = [
  {comp:"system", icon:"/imgs/bootloader.svg", runOnce:true, type:'system'},
  {comp:"dir", icon:"/imgs/dir.svg", type:'system'},
  {comp:"text", icon:"/imgs/text.svg", type:'system'},
  
  {comp:"modal", icon:"/imgs/circlequestion.svg"},
  {comp:"textmodal", icon:"/imgs/circlequestion.svg"},
  {comp:"filedialogue", icon:"/imgs/circlequestion.svg"},
  {comp:"contextmenu", icon:"/imgs/circlequestion.svg"},

  {comp:"testwindow"},
  {comp:"viewer", icon:"/imgs/viewer.svg"},
  {comp:"editor", },
  {comp:"browser",},
  {comp:"viewer"},
  {comp:"notepad", icon:"/imgs/notepad.svg"},
  {comp:"terminal", icon:"/imgs/terminal.svg"},
  {comp:"logger", icon:"/imgs/logger.svg", runOnce:true},
  {comp:"finder", icon:"/imgs/finder.svg"},
  {comp:"atelier", icon:"/imgs/atelier.svg"},
  {comp:"postman", icon:"/imgs/postman.svg", runOnce:true},
  {comp:"appstore", icon:"/imgs/appstore.svg"},
  {comp:"about", icon:"/imgs/jamos.png"},
  {comp:"settings", icon:"/imgs/settings.svg", runOnce:true},
  {comp:"styler", icon:"/imgs/styler.svg", runOnce:true},
  {comp:"systeminfo", icon:"/imgs/systeminfo.svg", runOnce:true},
  {comp:'simpleabout', icon:"/imgs/circlequestion.svg"},
  {comp:'toolbar', icon:"/imgs/circlequestion.svg", type:'system'},
]
export const ProcessCommands = _ProcessCommands.filter(cmd=>((cmd.type === 'window') || (cmd.type === undefined))).map(cmd=>cmd.comp);

export const SystemCommands = _ProcessCommands.filter(cmd=>cmd.type === 'system').map(cmd=>cmd.comp);

export const TotalCommands = _ProcessCommands.map(cmd=>cmd.comp);
export const runOnce = _ProcessCommands.filter(cmd=>cmd.runOnce).map(cmd=>cmd.comp);
const ProcessCommandsIcons = _ProcessCommands.map(cmd=>cmd.icon ?? "/imgs/icon-default.svg");