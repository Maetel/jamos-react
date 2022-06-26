import { useSelector } from "react-redux";
import store from "../../app/store";
import { ToolbarControl } from "../../grounds/Toolbar";
import Path, { addError, addLog } from "../../scripts/Path";
import { parseToolbarItem, ToolbarItem } from "../../scripts/ToolbarTypes";
import { dirValue, fileValue, selectFile } from "../file/fileSlice";
import Log from "../log/Log";
import SetMgr from "../settings/SetMgr";

import {
  addProc,
  closeDock,
  closeToolbar,
  increaseIndices,
  killAllProcs,
  killProc,
  minimize,
  openDock,
  openToolbar,
  processesValue,
  pushToLast,
  selectGroupedProcs,
  selectIsDockOpen,
  selectIsMinimized,
  selectIsToolbarOpen,
  selectProcessById,
  selectProcesses,
  selectProcInIndexOrder,
  setActiveWindow,
  setProcProps,
  setToolbarItem,
  toggleDock,
  toggleMaximize,
  toggleMinimize,
  toggleToolbar,
  unMinimize,
} from "./procSlice";
import Process, { ProcessCommands } from "./ProcTypes";

export class ProcController {
  public procmgr = ProcMgr.getInstance();
  constructor(public procId:string, private appselector){
  }
  kill(){this.procmgr.kill(this.procId)};
  killAll(){this.procmgr.killAll(this.procId)};
  psValue(){return this.procmgr.psValue()};
  public isFront(procId:string):boolean{
    return this.appselector(selectProcesses)?.find(proc=>proc.zIndex==='0')?.id === procId;
  }

  public get procs(){
    return this.appselector(selectProcesses);
  }
  public get procsInOrder(){
    return this.appselector(selectProcInIndexOrder);
  }

  getReadable() {
    return this.procs.find(proc=>proc.id===this.procId);
  }

  public maximize() {
    store.dispatch(toggleMaximize(this.procId));
  }
}

export default class ProcMgr{
  private static instance:ProcMgr;
  private constructor(){}
  public static getInstance():ProcMgr{
    if(!this.instance){
      this.instance = new ProcMgr();
    }
    return this.instance;
  }
  private id=1;
  private get getId(){
    return ''+this.id++;
  }

  private _prepareNewWindow(){
    store.dispatch(increaseIndices());
  }

  public kill(procId:string){
    ToolbarControl.getInstance().unregister(procId);
    store.dispatch(killProc(procId));
  }

  public killAll(procId?:string){
    store.dispatch(killAllProcs(procId));
  }

public psValue(){
  return processesValue();
}

  public exeFile(path: Path, args?: { [key: string]: any }) {
    const d = dirValue(path.path);
    if(d){
      //if is directory, open it
      this.exeCmd(d.node.exeCmd);
      return;
    }

    const f = fileValue(path.path);
    if (!f) {
      return;
    }
    this.exeCmd(f.node.exeCmd, { ...f.data, ...args, node: f.node });
  }

  public exeCmd(cmds: string, args?: { [key: string]: any }) {
    const _cmds = cmds.split(" ").filter((cmd) => cmd !== "" && cmd !== " ");
    const cmdCount = _cmds.length;
    if (cmdCount === 0) {
      return;
    }
    const cmd = _cmds.at(0);
    if (cmdCount === 1) {
      this.add(_cmds.at(0), args);
      return;
    }

    //parse commands with multiple arguments
    switch (cmd) {
      case "finder":
      case "notepad":
      case "markdown":
      case "browser":
      case "viewer":
        const path = _cmds.slice(1).join(" ");
        this.add(cmd, { path: path, ...args });
        break;
        case "styler":
          const style = _cmds.slice(1).join(" ");
          SetMgr.getInstance().setTheme(style);
        // this.add(cmd, { style: style, ...args });
        break;
      default:
        break;
    }
  }

  public add(procType:string, args:{}={}){

    if(!ProcessCommands.includes(procType)){
      addError(`ProcessCommands does not include : ${procType}`)
      return this;
    }

    this._prepareNewWindow();

    const _id = this.getId;
    const proc:Process ={
      id:_id,
      comp:procType,
      name:args['name'], //okay to be undefined
      zIndex:'0',
      resize:'both',
      toolbar:[],
      ...args
    }
    
    store.dispatch(addProc(proc));

    return this;
  }

  public front(){
    return useSelector(selectProcesses)?.find(proc=>proc.zIndex==='0');
  }
  public isFront(procId:string):boolean{
    return this.front()?.id === procId;
  }

  public get procs(){
    return useSelector(selectProcesses);
  }
  public get procsInOrder(){
    return useSelector(selectProcInIndexOrder);
  }

  public find(procId:string){
    return store.getState().proc.procs.find(proc=>proc.id===procId);
  }
  
  public findReadable(selector,procId:string) {
    return this.procs.find(proc=>proc.id===procId);
  }

  public toggleMaximize(procId:string) {
    store.dispatch(toggleMaximize(procId));
  }

  public setFront(procId:string){
    store.dispatch(unMinimize(procId));
    store.dispatch(setActiveWindow(procId));
  }

  public set (procId:string, props:{}){
    store.dispatch(setProcProps({id:procId, props:props}));
  }

  public get (procId:string, prop:string){
    // return this.find(procId)[prop];
    return this.find?.[prop];
  }

  public getReadable (selector, procId:string, prop:string){
    return this.findReadable(selector, procId)?.[prop];
  }

  public getToolbarItems ( procId:string):ToolbarItem[] {
    return store.getState().proc.procs.find(proc=>proc.id===procId)?.['toolbar'];
  }

  public setToolbarItem (procId:string, item:ToolbarItem){
    store.dispatch(setToolbarItem({id:procId, item:item}));
  }

  public isToolbarOpen(){
    return useSelector(selectIsToolbarOpen)
  }
  public isDockOpen(){
    return useSelector(selectIsDockOpen)
  }

  public toggleToolbar(){
    store.dispatch(toggleToolbar());
  }
  public openToolbar(){
    store.dispatch(openToolbar());
  }
  public closeToolbar(){
    store.dispatch(closeToolbar());
  }

  public toggleDock(){
    store.dispatch(toggleDock());
  }
  public openDock(){
    store.dispatch(openDock());
  }
  public closeDock(){
    store.dispatch(closeDock());
  }

  public toggleMinimize(procId:string){
    store.dispatch(toggleMinimize(procId))
  }
  public minimize(procId:string){
    store.dispatch(minimize(procId))
    store.dispatch(pushToLast(procId));
  }
  public unminimize(procId:string){
    store.dispatch(unMinimize(procId))
  }

  public isMinimized(procId:string){
    return useSelector(selectIsMinimized(procId));
  }

  public groupedProcs():{[key:string]:Process[]}{
    return useSelector(selectGroupedProcs);
  }
}