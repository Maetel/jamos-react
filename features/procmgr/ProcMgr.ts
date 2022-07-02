import { useAppSelector } from "../../app/hooks";
import store from "../../app/store";
import { ModalCallbacks, ModalProps } from "../../components/Modal";
import { ToolbarControl } from "../../grounds/Toolbar";
import Path, { addError } from "../../scripts/Path";
import {  ToolbarItem } from "../../scripts/ToolbarTypes";
import { dirValue, fileValue } from "../file/fileSlice";
import JamOS from "../JamOS/JamOS";

import {
  addProc,
  closeDock,
  closeToolbar,
  increaseIndices,
  killAllProcs,
  killProc,
  loadProcFromString,
  minimize,
  openDock,
  openToolbar,
  processesValue,
  pushToLast,
  selectFront,
  selectFrontsParent,
  selectGroupedProcs,
  selectIsDockOpen,
  selectIsMinimized,
  selectIsToolbarOpen,
  selectProcessById,
  selectProcesses,
  selectProcInIndexOrder,
  selectProcProp,
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
          JamOS.setmgr().setTheme(style);
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
      ...args //override by args
    }
    
    store.dispatch(addProc(proc));

    return this;
  }

  public openConfirmSave(procId:string, onSave:()=>any, onDontSave:()=>any,  args?: {title?:string,descs?:string[], buttons?:string[], onCancel?:()=>any}){
    let modalProps :ModalProps = {
      parent:procId,
      title:args?.title??'Save?',
      descs:args?.descs??['This action cannot be undone.'],
      buttons:args?.buttons??['Save', "Don't save", 'Cancel']
    };
    this.add('modal', {parent:procId, modal:modalProps});
    ModalCallbacks.register(procId, (val)=>{
      if(val==='Save'){
        onSave();
      } else if (val === "Don't save"){
        onDontSave();
      } else {
        args?.onCancel?.();
      }
    });
  }

  public openConfirm(procId:string, onConfirm:()=>void,  args?: {title?:string,descs?:string[], buttons?:string[], onCancel?:()=>any}){
    let modalProps :ModalProps = {
      parent:procId,
      title:args?.title??'Confirm?',
      descs:args?.descs??[],
      buttons:args?.buttons??['Okay', 'Cancel']
    };
    this.add('modal', {parent:procId, modal:modalProps});
    ModalCallbacks.register(procId, (val)=>{
      if(val==='Okay'){
        onConfirm();
      } else {
        args?.onCancel?.();
      }
    });
  }

  public openModal(procId:string, args?: {title?:string,descs?:string[], buttons?:string[], callbacks?:(()=>void)[]}){
    let modalProps :ModalProps = {parent:procId};
    if(args){
      modalProps = {...modalProps, ...args};
    }
    this.add('modal', {parent:procId, modal:modalProps});

    const callbackMap:{[key:string]:()=>void} = {};
    if(args?.buttons){
      args.buttons.forEach((btn,i)=>{
        if(args?.callbacks?.at(i)){
          callbackMap[btn] = args.callbacks.at(i);
        }
      })
    }
    ModalCallbacks.register(procId, (val)=>{
      callbackMap[val]?.();
    })
  }

  public frontsParent(){
    throw new Error("Not implemented");
    
    return useAppSelector(selectFrontsParent);
  }

  public front(){
    return useAppSelector(selectFront);
  }
  public isFront(procId:string):boolean{
    return this.front()?.id === procId;
  }

  public get procs(){
    return useAppSelector(selectProcesses);
  }
  public get procsInOrder(){
    return useAppSelector(selectProcInIndexOrder);
  }

  public find(procId:string){
    return store.getState().proc.procs.find(proc=>proc.id===procId);
  }
  
  public findReadable(procId:string) {
    // return this.procs.find(proc=>proc.id===procId);
    return useAppSelector(selectProcessById(procId));
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

  public getValue (procId:string, prop:string){
    return store.getState().proc.procs.find(proc=>proc.id===procId)?.[prop];
  }

  public getReadable (procId:string, prop:string){
    // return this.find(procId)[prop];
    return useAppSelector(selectProcProp(procId, prop))
  }

  public getToolbarItems ( procId:string):ToolbarItem[] {
    return store.getState().proc.procs.find(proc=>proc.id===procId)?.['toolbar'];
  }

  public setToolbarItem (procId:string, item:ToolbarItem){
    store.dispatch(setToolbarItem({id:procId, item:item}));
  }

  public isToolbarOpen(){
    return useAppSelector(selectIsToolbarOpen)
  }
  public isDockOpen(){
    return useAppSelector(selectIsDockOpen)
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
    return useAppSelector(selectIsMinimized(procId));
  }

  public groupedProcs():{[key:string]:Process[]}{
    return useAppSelector(selectGroupedProcs);
  }

  public stringify():string{
    const s = store.getState().proc;
    return JSON.stringify(s);
  }

  public async loadFromString(data:string) {
    try {
      const parsed = await JSON.parse(data);
      this.killAll();
      store.dispatch(loadProcFromString(parsed));
      
      
    } catch (error) {
      console.error(error);
    }
    this.id = this.psValue().length+1;
      console.log("Id after load: ",this.id);
  }
}
