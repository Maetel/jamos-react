import { useAppDispatch, useAppSelector } from "../../app/hooks";
import store from "../../app/store";
import { CtxMenuProps } from "../../components/ContextMenu";
import FileMgr from "../file/FileMgr";
import ProcMgr from "../procmgr/ProcMgr";
import {killAllofType} from "../procmgr/procSlice";
import SetMgr from "../settings/SetMgr";
import { Theme } from "../settings/Themes";
import CallbackStore from "./Callbacks";
import { closeDock, closeToolbar, forceHideDock, forceHideToolbar, forceOpenDock, forceOpenToolbar, Notif, openDock, openToolbar, selectForceHideDock, selectForceHideToolbar, selectForceOpenDock, selectForceOpenToolbar, selectIsDockOpen, selectIsToolbarOpen, selectNotifDuration, selectNotifs, setNotification, toggleDock, toggleToolbar } from "./osSlice";

export interface SerializedData {
  proc?:string,
  files?:string,
  settings?:string,
  [key:string]:string|number|boolean,
}


export default class JamOS {
  
  public static get procmgr() {return ProcMgr.getInstance()};
  public static get filemgr() {return FileMgr.getInstance()};
  public static get setmgr() {return SetMgr.getInstance()};
  public static get theme():Theme { return SetMgr.getInstance().themeReadable();}
  public static get notifs() {
    return useAppSelector(selectNotifs);
  }
  public static get notifDuration() {
    return useAppSelector(selectNotifDuration);
  }
  public static setNotif(msg:string, type?:'log'|'success'|'warn'|'error'|'system'){
    const notif:Notif = {
      msg:msg, type:(type??'log')
    };
    store.dispatch(setNotification(notif))
    // useAppDispatch(setNotification(notif));
  }

  public static stringify():string{
    const retval:SerializedData = {
      proc:ProcMgr.getInstance().stringify(),
      files:FileMgr.getInstance().stringify(),
      settings:SetMgr.getInstance().stringify(),
    }
    return JSON.stringify(retval);
  }
  public static async loadFromString(data:string){
      // console.log("JamOS load data :",data);
      const parsed:SerializedData = JSON.parse(data);
    const cbs = {
      'proc' : async (_data)=>{ await ProcMgr.getInstance().loadFromString(_data) },
      'files' : async (_data)=>{ await FileMgr.getInstance().loadFromString(_data) },
      'settings' : async (_data)=>{ await SetMgr.getInstance().loadFromString(_data) },
    }
    try{
      for(let key in parsed){
        await cbs[key]?.(parsed[key]);
      }
    } catch(err){
      console.error(err);
    }
  }
  public static saveData(key:string,val:string){
    localStorage.setItem(key,val)
  }
  public static loadData(key:string):string{
    return localStorage.getItem(key);
  }

    public static reset(){
      localStorage.clear();
    }
    public static closeAllContextMenus(){
      store.dispatch(killAllofType('contextmenu'));
    }
  public static openContextMenu(x:number, y:number, items:string[], callbacks:(()=>void)[], args?:{ onMount?:string, onDestroy?:string }){
    const itemsFiltered = items.filter(item=>(item!=='__separator__'));
    if(itemsFiltered.length !== callbacks.length){
      throw new Error("");
    }
    
    const ids = itemsFiltered.map(item=>`system/ContextMenu/${item}`)
    callbacks.forEach((cb,i)=>{
      CallbackStore.register(ids.at(i),cb);
    })
    const props:CtxMenuProps = {
      pageX:x,
      pageY:y,
      items:items,
      callbackIds:ids,
    }
    this.procmgr.add('contextmenu', {parent:'system', ctxMenuProps:props, onDestroy:args?.onDestroy, onMount:args?.onMount});
  }


  public static isToolbarFixed(){
    return useAppSelector(selectIsToolbarOpen);
  }
  public static isToolbarOpenForced(){
    return useAppSelector(selectForceOpenToolbar);
  }
  public static isToolbarHiddenForced(){
    return useAppSelector(selectForceHideToolbar);
  }
  public static isDockFixed(){
    return useAppSelector(selectIsDockOpen);
  }
  public static isDockOpenForced(){
    return useAppSelector(selectForceOpenDock);
  }
  public static isDockHiddenForced(){
    return useAppSelector(selectForceHideDock);
  }

  public static toggleToolbar(){
    store.dispatch(toggleToolbar());
  }
  public static openToolbar(){
    store.dispatch(openToolbar());
  }
  public static closeToolbar(){
    store.dispatch(closeToolbar());
  }
  public static forceHideToolbar(hide:boolean = true){
    store.dispatch(forceHideToolbar(hide));
  }
  public static forceOpenToolbar(open:boolean = true){
    store.dispatch(forceOpenToolbar(open));
  }

  public static toggleDock(){
    store.dispatch(toggleDock());
  }
  public static openDock(){
    store.dispatch(openDock());
  }
  public static closeDock(){
    store.dispatch(closeDock());
  }
  public static forceHideDock(hide:boolean = true){
    store.dispatch(forceHideDock(hide));
  }
  public static forceOpenDock(open:boolean = true){
    store.dispatch(forceOpenDock(open));
  }
}