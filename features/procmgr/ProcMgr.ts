import { useAppSelector } from "../../app/hooks";
import store from "../../app/store";
import { FileDialProps } from "../../components/FileDialogue";
import { ModalProps } from "../../components/Modal";
import Path, { addError } from "../../scripts/Path";
import {  ToolbarItem, ToolbarItemId, ToolbarItemIdRaw } from "../../scripts/ToolbarTypes";
import { randomId } from "../../scripts/utils";
import { dirValue, fileValue } from "../file/fileSlice";
import { Node } from "../file/FileTypes";
import CallbackStore from "../JamOS/CallbackStore";
import JamOS from "../JamOS/JamOS";

import {
  addProc,
  addToolbarItem,
  increaseIndices,
  killAllofType,
  killAllProcs,
  killProc,
  loadProcFromString,
  minimize,
  processesValue,
  pushToLast,
  removeAllToolbarItems,
  removeToolbarItem,
  selectFront,
  selectFrontsParent,
  selectGroupedProcs,
  selectGroupedProcsForDock,
  selectIsMinimized,
  selectProcessById,
  selectProcesses,
  selectProcessesOfType,
  selectProcessOfType,
  selectProcInIndexOrder,
  selectProcProp,
  setActiveWindow,
  setProcProps,
  toggleMaximize,
  toggleMinimize,
  unMinimize,
  updateToolbarItem,
} from "./procSlice";
import Process, { ProcessCommand, ProcessCommands, Rect, _ProcessCommands } from "./ProcTypes";


export default class ProcMgr{
  private static instance:ProcMgr;
  private constructor(){}
  public static getInstance():ProcMgr{
    if(!this.instance){
      this.instance = new ProcMgr();
    }
    return this.instance;
  }

  private _prepareNewWindow(){
    store.dispatch(increaseIndices());
  }

  public kill(procId:string){
    //kill first
    store.dispatch(killProc(procId));
    CallbackStore.unregisterByProcID(procId);
  }

  public killAll(procId?:string){
    store.dispatch(killAllProcs(procId));
  }

  public processesValue(){
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
        const dirpath = _cmds.slice(1).join(" ");
        const dirnode:Node = dirValue(dirpath)?.node;
        this.add(cmd, { path: dirpath, node:dirnode, ...args });
        break;
      case "notepad":
      case "markdown":
      case "browser":
      case "viewer":
        const path = _cmds.slice(1).join(" ");
        const node:Node = dirValue(path)?.node ?? fileValue(path)?.node;
        this.add(cmd, { path: path, node:node, ...args });
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

  private static maxId():number{
    return store.getState().proc.procs.filter(proc=>proc.id!=='system')?.reduce((prev,next)=>{
      return prev < parseInt(next.id) ? parseInt(next.id) : prev;
    },0) ?? 1;
  }

  private static _id = 0;
  private static get getId() { 
    const maxId = Math.max(ProcMgr._id, ProcMgr.maxId()) + 1;
    ProcMgr._id = maxId;
    return maxId;
  }
  public add(procType:string, args:{}={}){

    if(!ProcessCommands.includes(procType)){
      addError(`ProcessCommands does not include : ${procType}`)
      return this;
    }

    this._prepareNewWindow();

    // const _id = ''+randomId();

    const _id = ''+ProcMgr.getId;
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
    // CallbackStore.register(`${procId}/Modal/`)
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
    const callbackId = `${procId}/Modal/${modalProps.title}`;
    modalProps.callbackIds=[callbackId];
    CallbackStore.register(callbackId,onConfirm);

    this.add('modal', {parent:procId, modal:modalProps});
  }

  public openModal(procId:string, args?: {title?:string,descs?:string[], buttons?:string[], callbacks?:((params?:any)=>void)[], type?:'modal'|'textmodal', rect?:Rect}){
    let modalProps :ModalProps = {parent:procId};

    if(args){
      modalProps = {...modalProps, ...args};
      const skips = ['callbacks', 'rect'];
      skips.forEach(skip=>{
        if(modalProps[skip]){
          delete modalProps[skip];
        }
      })
    }

    const callbackIds:string[] = [];
    args?.buttons?.forEach((btn,i)=>{
      const id = `${procId}/Modal/${btn}`;
      const callbackExists = args?.callbacks?.at(i);
      CallbackStore.register(id, callbackExists?args.callbacks.at(i):(params)=>{
        // console.log("Placeholder callback, params:",params);
      })
      callbackIds.push(id);
    })
    modalProps = {...modalProps, ...{callbackIds:callbackIds}};
    const addArgs = {parent:procId, modal:modalProps};
    if(args?.rect){
      addArgs['rect'] = args.rect;
    }
    console.log("addArgs:",addArgs);
    this.add(args?.type ?? 'modal', addArgs);
    // Object.assign(modalProps, {callbackIds:callbackIds})
    // modalProps['callbackIds'] = callbackIds;

    if(false && args?.buttons?.length !== args?.callbacks?.length){
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

  public openFileDialogue(procId:string, type:'Save'|'Load', args?: {name?:string, pathHint?:string, includes?:string[], excludes?:string[], onOkay?: (params?)=>void,
    onCancel?: (params?)=>void,onExit?: (params?)=>void,}){

    const onOkayCallbackId = `${procId}/FileDialogue/onOkay`;
    const onCancelCallbackId = `${procId}/FileDialogue/onCancel`;
    const onExitCallbackId = `${procId}/FileDialogue/onExit`;
    if(args?.onOkay){
      CallbackStore.register(onOkayCallbackId, args?.onOkay);
    } else {
      CallbackStore.unregister(onOkayCallbackId);
    }
    if(args?.onCancel){
      CallbackStore.register(onCancelCallbackId, args?.onCancel);
    } else {
      CallbackStore.unregister(onCancelCallbackId);
    }
    if(args?.onExit){
      CallbackStore.register(onExitCallbackId, args?.onExit);
    } else {
      CallbackStore.unregister(onExitCallbackId);
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
    const node:Node = dirValue(args?.pathHint)?.node ?? dirValue('~').node;
    const retval = {parent:procId, fileDialProps:fileDialProps, node:node};
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

  public addToolbarItem (procId:string, menu:string, item:string, cb:()=>void, args?:{separator?:boolean, disabled?:boolean,callback?:string, order?:number}){
    const tbItem :ToolbarItem = {
      caller:procId,
      menu:menu,
      item:item,
      callback: args?.callback ?? ToolbarItemIdRaw(procId,menu,item),
    }
    if(args){
      Object.assign(tbItem, args);
    }
    store.dispatch(addToolbarItem({id:procId, item:tbItem}));
    CallbackStore.register(ToolbarItemId(tbItem), cb);
    return this;
  }

  public updateToolbarItem (procId:string, fromMenu:string, fromItem:string, changeTo:{
    menu?: string,
    item?: string,
    order?:number,
    disabled?: boolean,
    separator?: boolean,
    cb?:()=>void,
  }){
    const toolbar:ToolbarItem[] = this.getValue(procId, 'toolbar');
    const fromId = ToolbarItemIdRaw(procId, fromMenu, fromItem);
    const toId = ToolbarItemIdRaw(procId, changeTo.menu??fromMenu, changeTo.item??fromItem);
    const found:ToolbarItem = toolbar?.find(tb=>ToolbarItemId(tb)===fromId);
    if(!found){
      console.error('Failed to update toolbar item : '+ fromId);
      return this;
    }

    const copied:ToolbarItem = {...found};
    let cb:()=>void=null;
    if(changeTo.cb){
      cb = changeTo.cb;
      delete changeTo.cb;
    }
    Object.assign(copied, changeTo);

    if(fromId !== toId){
      CallbackStore.unregister(fromId);
    }
    store.dispatch(updateToolbarItem({id:procId, from:found, to:copied}));
    if(cb){
      CallbackStore.register(toId, cb);
    }
    return this;
  }

  public removeToolbarItem (procId:string, menu:string, item:string){
    store.dispatch(removeToolbarItem({id:procId, menu:menu, item:item}));
    CallbackStore.unregister(ToolbarItemIdRaw(procId, menu, item));
    return this;
  }

  public removeAllToolbarItems (procId:string){
    store.dispatch(removeAllToolbarItems(procId));
    CallbackStore.unregisterByProcID(`${procId}/Toolbar`);
    return this;
  }

  public killAllofType(type:string){
    store.dispatch(killAllofType(type));
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
    const pm = ProcMgr.getInstance();
    try {
      const parsed = await JSON.parse(data);
      pm.killAll();
      store.dispatch(loadProcFromString(parsed));
    } catch (error) {
      console.error(error);
    }
    ProcMgr._id = pm.processesValue().filter(proc=>typeof proc.id ==="number").reduce((prev,next)=>{ const nextId:number = parseInt(next.id); return prev<nextId ? nextId : prev; },-1) + 1
  }

  public blink(procId:string, timeout_ms = 300){
    this.set(procId, { beginBlink:true, endBlink:false})
      setTimeout(()=>{
      this.set(procId, { beginBlink:false, endBlink:true})
    }, timeout_ms);
  }

  public processesOfType(type:string):Process[]{
    return useAppSelector(selectProcessesOfType(type));
  }

  public processReadable(procId:string):Process{
    return useAppSelector(selectProcessById(procId));
  }
  public processValue(procId:string):Process{
    return store.getState().proc.procs.find(_proc=>_proc.id===procId);
  }

  // returns first process found
  public processOfTypeValue(type:string):Process{
    return store.getState().proc.procs.find(_proc=>_proc.comp===type);
  }

  // returns first process found
  public processOfTypeReadable(type:string):Process{
    return useAppSelector(selectProcessOfType(type));
  }
}
