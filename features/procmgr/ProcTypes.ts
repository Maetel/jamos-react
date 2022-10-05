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
  toolbar:ToolbarItem[],
  desc?:string, // to be displayed on dock context menu
  node?:Node,
  killable?:boolean,
  runOnce?:boolean,

  style?:{[key:string]:string}, //whatever additional styles
  children?:string[], // automatically added in procSlice.addProc reducer
  parent?:string, //in case this is a child process

  //value input from modal (child) window
  // modalRetval?:string,
  // textmodalRetval?:string,
  // moveFrom?:string,
  
  //callbackIds, can be found in CallbackStore.callbacks
  onFront?:string,
  onFocusOut?:string,
  // onMount?:string,   //better be handled at each component
  // onDestroy?:string, //better be handled at each component
  onBackgroundClick?:string,
  onDragEnter?:string,
  onDragLeave?:string,
  onDrop?:string,
  onClick?:string,

  //actions
  beginBlink?:boolean,
  endBlink?:boolean,

  //window options
  hideNav?:boolean,
  hideNavButtons?:boolean,
  hideOnDock?:boolean,
  hideOnToolbar?:boolean,
  disableBackground?:boolean,
  opaqueBackground?:boolean,
  closeOnBackgroundClick?:boolean,
  closeOnEscape?:boolean,
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
  imageIdx?:number,
  finderIconDragging?:boolean,
  saveWorldLocal?:boolean,
  loadWorldLocal?:boolean,

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
  name:string,
  type?:'window'|'daemon'|'system', // if undefined, 'window'. 'system' cannot be called manually
  icon?:string, // if undefined, "/imgs/icon-default.svg"
  runOnce?:boolean, // if undefined, false
  addOnAppstore?:boolean,
  defaultFileName?:string,
  hideOnDock?:boolean,
  hideOnToolbar?:boolean,
  onTerminal?:boolean,
}

export const ProcessTypeName = (type:string):string=>{
  return _ProcessCommands.find(cmd=>cmd.comp===type)?.name;
}

export const _ProcessCommands:ProcessCommand[] = [
  {comp:"system", name:"JamOS System", icon:"/imgs/bootloader.svg", runOnce:true, type:'system', hideOnDock:true, hideOnToolbar:true},
  {comp:"dir",name:"Directory", icon:"/imgs/dir.svg", type:'system', hideOnDock:true, hideOnToolbar:true},
  {comp:"text",name:"Text", icon:"/imgs/text.svg", type:'system', hideOnDock:true, hideOnToolbar:true},
  
  {comp:"modal",name:"Modal", icon:"/imgs/circlequestion.svg", hideOnDock:true, hideOnToolbar:true},
  {comp:"textmodal", name:"TextModal",icon:"/imgs/circlequestion.svg", hideOnDock:true, hideOnToolbar:true},
  {comp:"filedialogue", name:"FileDialogue",icon:"/imgs/circlequestion.svg", hideOnDock:true, hideOnToolbar:true},
  {comp:"contextmenu", name:"Context Menu",icon:"/imgs/circlequestion.svg", hideOnDock:true, hideOnToolbar:true},
  {comp:'toolbar',name:"Toolbar", icon:"/imgs/circlequestion.svg", type:'system'},
  
  {comp:"appstore", name:"AppStore",icon:"/imgs/appstore.svg", defaultFileName:"AppStore",addOnAppstore:true, onTerminal:true},
  {comp:"testwindow", name:'Test Window', defaultFileName:"Test Window", onTerminal:true},
  {comp:"viewer",name:"Viewer", icon:"/imgs/viewer.svg", addOnAppstore:true, defaultFileName:"Viewer", onTerminal:true},
  {comp:"browser",name:"Browser",},
  {comp:"notepad", name:"Notepad",icon:"/imgs/notepad.svg", addOnAppstore:true, defaultFileName:"Notepad", onTerminal:true},
  {comp:"terminal", name:"Terminal",icon:"/imgs/terminal.svg", addOnAppstore:true, defaultFileName:"Terminal", onTerminal:true},
  {comp:"logger",name:"Logger", icon:"/imgs/logger.svg", runOnce:true, addOnAppstore:true, defaultFileName:"Logger", onTerminal:true},
  {comp:"finder",name:"Finder", icon:"/imgs/dir.svg", addOnAppstore:true, defaultFileName:"Finder", onTerminal:true},
  {comp:"atelier",name:"Atelier", icon:"/imgs/atelier.svg", addOnAppstore:true, defaultFileName:"Atelier", onTerminal:true},
  {comp:"postman", name:"Postman",icon:"/imgs/postman.svg", runOnce:true, addOnAppstore:true, defaultFileName:"Postman", onTerminal:true},
  {comp:"about",name:"About", icon:"/imgs/jamos.png", addOnAppstore:true, defaultFileName:"About", onTerminal:true},
  {comp:"notif",name:"Notifications", icon:"/imgs/notif.svg", addOnAppstore:true, defaultFileName:"Notifications", runOnce:true, onTerminal:true},
  {comp:"settings", name:"Settings",icon:"/imgs/settings.svg", runOnce:true, addOnAppstore:true, defaultFileName:"Settings", onTerminal:true},
  {comp:"styler", name:"Styler",icon:"/imgs/styler.svg", runOnce:true, addOnAppstore:true, defaultFileName:"Styler", onTerminal:true},
  {comp:"tutorial", name:"Tutorial",icon:"/imgs/tutorial.svg", runOnce:true, addOnAppstore:true, defaultFileName:"Tutorial", onTerminal:true},
  {comp:"systeminfo",name:"SystemInfo", icon:"/imgs/systeminfo.svg", runOnce:true, addOnAppstore:true, 
  defaultFileName:"System Monitor", onTerminal:true},
  {comp:'simpleabout',name:"About", icon:"/imgs/circlequestion.svg"},

  //network usage
  {comp:'comments',name:"Leave comments!", icon:"/imgs/comments.svg", runOnce:true, addOnAppstore:true, defaultFileName:"Comments", onTerminal:true},
  {comp:'welcome',name:"Welcome",runOnce:true, addOnAppstore:true, defaultFileName:"Welcome"},
  {comp:'jamhub',name:"JamHub", icon:"/imgs/jamos.png", runOnce:true, addOnAppstore:true, defaultFileName:"JamHub", onTerminal:true},
  {comp:'worldeditor',name:"WorldEditor", icon:"/imgs/worldeditor.svg", runOnce:true, addOnAppstore:true, defaultFileName:"World Editor", onTerminal:true},
  {comp:'features',name:"Features", icon:"/imgs/features.svg", runOnce:true, addOnAppstore:true, defaultFileName:"Features", onTerminal:true},


]
export const AddOnAppstores = _ProcessCommands.filter(cmd=>cmd.addOnAppstore);
export const ProcessCommands = _ProcessCommands.filter(cmd=>((cmd.type === 'window') || (cmd.type === undefined))).map(cmd=>cmd.comp);
export const AddOnTerminals = _ProcessCommands.filter(cmd=>cmd.onTerminal).map(cmd=>cmd.comp);

export const SystemCommands = _ProcessCommands.filter(cmd=>cmd.type === 'system').map(cmd=>cmd.comp);

export const TotalCommands = _ProcessCommands.map(cmd=>cmd.comp);
export const runOnce = _ProcessCommands.filter(cmd=>cmd.runOnce).map(cmd=>cmd.comp);
const ProcessCommandsIcons = _ProcessCommands.map(cmd=>cmd.icon ?? "/imgs/icon-default.svg");