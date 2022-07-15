import axios from "axios";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import store from "../../app/store";
import { CtxMenuProps } from "../../components/ContextMenu";
import { getCookie } from "../../scripts/utils";
import FileMgr from "../file/FileMgr";
import ProcMgr from "../procmgr/ProcMgr";
import {killAllofType} from "../procmgr/procSlice";
import SetMgr from "../settings/SetMgr";
import { Theme } from "../settings/Themes";
import CallbackStore from "./CallbackStore";
import { closeDock, closeToolbar, forceHideDock, forceHideToolbar, forceOpenDock, forceOpenToolbar, getUser, getWorld, JamUser, JamWorld, Notif, openDock, openToolbar, selectForceHideDock, selectForceHideToolbar, selectForceOpenDock, selectForceOpenToolbar, selectIsDockOpen, selectIsToolbarOpen, selectNotifDuration, selectNotifs, selectUser, selectWorld, setNotification, setUser, toggleDock, toggleToolbar, signout, setWorld, _initialWorld } from "./osSlice";

export interface SerializedData {
  proc?:string,
  files?:string,
  settings?:string,
  [key:string]:string|number|boolean,
}


export default class JamOS {
  public static get version() {return '0.2'};
  public static get procmgr() {return ProcMgr.getInstance()};
  public static get filemgr() {return FileMgr.getInstance()};
  public static get setmgr() {return SetMgr.getInstance()};
  public static get theme():Theme { return SetMgr.getInstance().themeReadable();}
  public static toggle(procId:string, prop:string){
    const retval = {};
    const val = JamOS.procmgr.getValue(procId, prop);
    if(!(val === 'boolean' || val === undefined)){
      console.log("val",val);
      return false;
    }
    retval[prop] = !val;
    JamOS.procmgr.set(procId, retval);
    return true;
  }
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


    if(type==='error'){
      console.error('[Error] ' +msg);
    }
    if(type==='system'){
      console.log('[System] ' +msg);
    }
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
  public static saveStringified(){
    console.log("saveStringified");
    JamOS.saveData("stringifiedJamOS",  JamOS.stringify());
  }
  public static loadStringified(){
    console.log("loadStringified");
    const data = JamOS.loadData("stringifiedJamOS");
    if(data){
      JamOS.loadFromString(data);
    }
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

  public static get server() {
    const server =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/"
    : "https://jamos-v2.herokuapp.com/";
// const server = 'http://jamos-v2/';
return server;
  }
  public static get apis() {
    const retval = {
      posts : "post", //get,post
      signup : "user/signup",  //post
      signin : "user/signin",  //post
      signincheck : "user/check",  //get
      worldList : 'world/list', //get
      worldCreate : 'world/create', // post 
      worldSave : 'world/data', //post
      worldLoad : 'world/data/', //get
    }
    for ( let key in retval){
      retval[key] = this.server + retval[key];
    }
    return retval;
  }

  public static userValue():JamUser{
    return getUser();
  }
  public static userReadable():JamUser {
    return useAppSelector(selectUser);
  }
  public static worldValue():JamWorld{
    return getWorld();
  }
  public static worldReadable():JamWorld {
    return useAppSelector(selectWorld);
  }

  public static get authHeader () {
    // const token = getCookie('accessToken');
    const token = this.userValue().token;
    return token ? { headers: {"Authorization" : `Bearer ${token}`} } : {};
  }

  public static signin(userId:string, accessToken:string, refreshToken:string){
    const user:JamUser = {
      id : userId,
      signedin:true,
      token:accessToken
    }
    store.dispatch(setUser(user));
  }

  public static signout(){
    store.dispatch(signout());
  }

  public static setWorld(wid:string) {
    store.dispatch(setWorld(wid));
  }

  public static saveWorld(type:SaveWorldType='os'){
    const saveable = this.userValue().signedin && this.worldValue().name !==_initialWorld.name;
    if(!saveable){
      return;
    }

    const isOs = type==='os';
    const data = {};
    if(type==='file' || isOs){
      data['file'] = JamOS.filemgr.stringify()
    }
    if(type==='proc' || isOs){
      data['proc'] = JamOS.procmgr.stringify();
    }
    if(type==='setting' || isOs){
      data['setting'] = JamOS.setmgr.stringify();
    }
    const wid = this.worldValue().name;
    const payload = {
      type:type,
      data:data,
      wid:wid
    }
    const res = axios.post(this.apis.worldSave, payload, this.authHeader).then(res=>{
      console.log(res);
    }).catch(console.error)
  }
  public static loadWorld(wid?:string){
    wid = wid ?? this.worldValue().name;
    axios.get(this.apis.worldLoad+wid,this.authHeader).then(res=>{
      
      const funcMap = {
        file:JamOS.filemgr.loadFromString,
        proc:JamOS.procmgr.loadFromString,
        setting:JamOS.setmgr.loadFromString,
      }
      const content = res.data;
      for(let key in funcMap){
        if(content[key]){
          console.log("Loading ",key);
          funcMap[key](content[key]);
        }
      }
    }).catch(err=>{
      console.error(err);
    });
  }

  public static format(){
    const home = JamOS.filemgr.dirValue('~');
    home.dirs.forEach(dir=>JamOS.filemgr.rmdir(dir.node.path));
    home.files.forEach(file=>JamOS.filemgr.rm(file.node.path));
  }
}
export type SaveWorldType = 'os' | 'file' | 'proc' | 'setting';