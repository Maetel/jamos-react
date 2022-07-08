import { useAppSelector } from "../../app/hooks";
import store from "../../app/store";
import { FileDialProps } from "../../components/FileDialogue";
import { ModalProps } from "../../components/Modal";
import { ToolbarControl } from "../../grounds/Toolbar";
import Path, { addError } from "../../scripts/Path";
import {  ToolbarItem } from "../../scripts/ToolbarTypes";
import { dirValue, fileValue } from "../file/fileSlice";
import CallbackStore from "../JamOS/Callbacks";
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
  selectGroupedProcsForDock,
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
import Process, { ProcessCommand, ProcessCommands, _ProcessCommands } from "./ProcTypes";


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
      this.exeCmd(d.node.exeCmd, {node : d.node});
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
        JamOS.setmgr.setTheme(style);
        // this.add(cmd, { style: style, ...args });
        break;
      default:
        break;
    }
  }

  public bootload(){
    this._prepareNewWindow();
    const proc:Process ={
      id:'system',
      comp:'system',
      name:'JamOS System Manager', //okay to be undefined
      zIndex:'0',
      toolbar:[],
      hideOnDock:true,
    }
    const byDefault:ProcessCommand = _ProcessCommands.find(proc=>proc.comp==='system');
    byDefault.icon = byDefault.icon ?? "/imgs/icon-default.svg";
    byDefault.runOnce = byDefault.runOnce ?? false;
    byDefault.type = byDefault.type ?? 'window';
    Object.assign(proc, byDefault)
    store.dispatch(addProc(proc));
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
      // resize:'both',
      toolbar:[],
      ...args //override by args
    }

    //by default
    const byDefault:ProcessCommand = _ProcessCommands.find(proc=>proc.comp===procType);
    byDefault.icon = byDefault.icon ?? "/imgs/icon-default.svg";
    byDefault.runOnce = byDefault.runOnce ?? false;
    byDefault.type = byDefault.type ?? 'window';
    Object.assign(proc, byDefault)
    
    store.dispatch(addProc(proc));

    return this;
  }

  public openConfirmSave(procId:string, onSave:()=>any, onDontSave?:()=>any,  args?: {title?:string,descs?:string[], buttons?:string[], onCancel?:()=>any}){
    let modalProps :ModalProps = {
      parent:procId,
      title:args?.title??'Save?',
      descs:args?.descs??['This action cannot be undone.'],
      buttons:args?.buttons?? (onDontSave?['Save', "Don't save", 'Cancel']:['Save', 'Cancel'])
    };
    //TODO
    // CallbackStore.registerById(`${procId}/Modal/`)
    // this.add('modal', {parent:procId, modal:modalProps});
    // ModalCallbacks.register(procId, (val)=>{
    //   if(val==='Save'){
    //     onSave();
    //   } else if (val === "Don't save"){
    //     onDontSave?.();
    //   } else {
    //     args?.onCancel?.();
    //   }
    // });
  }

  public openConfirm(procId:string, onConfirm:()=>void,  args?: {title?:string,descs?:string[], buttons?:string[], onCancel?:()=>any}){
    let modalProps :ModalProps = {
      parent:procId,
      title:args?.title??'Confirm?',
      descs:args?.descs??[],
      buttons:args?.buttons??['Okay', 'Cancel']
    };
    this.add('modal', {parent:procId, modal:modalProps});

    //TODO
    // ModalCallbacks.register(procId, (val)=>{
    //   if(val==='Okay'){
    //     onConfirm();
    //   } else {
    //     args?.onCancel?.();
    //   }
    // });
  }

  public openModal(procId:string, args?: {title?:string,descs?:string[], buttons?:string[], callbacks?:((params?:any)=>void)[], type?:'modal'|'textmodal'}){
    let modalProps :ModalProps = {parent:procId};
    if(args){
      modalProps = {...modalProps, ...args};
      if(modalProps['callbacks']){
        delete modalProps['callbacks'];
      }
    }

    const callbackIds:string[] = [];
    args?.buttons?.forEach((btn,i)=>{
      const id = `${procId}/Modal/${btn}`;
      const callbackExists = args?.callbacks?.at(i);
      CallbackStore.registerById(id, callbackExists?args.callbacks.at(i):(params)=>{
        console.log("Placeholder callback, params:",params);
      })
      callbackIds.push(id);
    })
    modalProps = {...modalProps, ...{callbackIds:callbackIds}};
    this.add(args?.type ?? 'modal', {parent:procId, modal:modalProps});
    // Object.assign(modalProps, {callbackIds:callbackIds})
    // modalProps['callbackIds'] = callbackIds;

    if(args?.buttons?.length !== args?.callbacks?.length){
      console.warn("openModal : button and callback count do not match. ")
      console.warn(' - args?.buttons?.length : ',args?.buttons?.length)
      console.warn(' - args?.callbacks?.length : ',args?.callbacks?.length);
    }
  }

  public openTextModal(procId:string, args?:{title?:string, placeholder?:string, descs?:string[], buttons?:string[], callbacks?:((params?:any)=>void)[]}) {
    const defaultArgs = {
      title:args?.title?? 'Input text',
      descs:args?.descs,
      buttons:args?.buttons ?? ['Okay', 'Cancel'],
      callbacks:args?.callbacks,
      type:'textmodal' as ('modal'|'textmodal'),
      placeholder:args?.placeholder
    }

    this.openModal(procId, defaultArgs)
  }


  // watch proc.fileDial for retval
  public openFileDialogue(procId:string, type:'Save'|'Load', args?: {name?:string, includes?:string[], excludes?:string[], onOkay?: (params?)=>void,
    onCancel?: (params?)=>void,onExit?: (params?)=>void,}){

    const onOkayCallbackId = `${procId}/FileDialogue/onOkay`;
    const onCancelCallbackId = `${procId}/FileDialogue/onCancel`;
    const onExitCallbackId = `${procId}/FileDialogue/onExit`;
    if(args?.onOkay){
      CallbackStore.registerById(onOkayCallbackId, args?.onOkay);
    } else {
      CallbackStore.unregisterById(onOkayCallbackId);
    }
    if(args?.onCancel){
      CallbackStore.registerById(onCancelCallbackId, args?.onCancel);
    } else {
      CallbackStore.unregisterById(onCancelCallbackId);
    }
    if(args?.onExit){
      CallbackStore.registerById(onExitCallbackId, args?.onExit);
    } else {
      CallbackStore.unregisterById(onExitCallbackId);
    }

    let fileDialProps :FileDialProps = {
      parent:procId,
      type:type,
      onOkayCallbackId:onOkayCallbackId,
      onCancelCallbackId:onCancelCallbackId,
      onExitCallbackId:onExitCallbackId,
    };
    const merges = ['includes', 'excludes'];
    merges.forEach(key=>{
      if(args[key]){
        fileDialProps[key] = args[key];
      }
    })
    const retval = {parent:procId, fileDialProps:fileDialProps};
    if(args?.name){
      retval['name'] = args.name;
    }
    this.add('filedialogue', retval);
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
    const found = store.getState().proc.procs.find(proc=>proc.id===procId);
    return found?.[prop];
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
  public groupedProcsForDock():{[key:string]:Process[]}{
    return useAppSelector(selectGroupedProcsForDock);
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
