import axios from "axios";
import { useAppSelector } from "../../app/hooks";
import store from "../../app/store";
import { CtxMenuProps } from "../../components/ContextMenu";
import FileMgr from "../file/FileMgr";
import ProcMgr from "../procmgr/ProcMgr";
import {killAllofType} from "../procmgr/procSlice";
import SetMgr from "../settings/SetMgr";
import { Theme } from "../settings/Themes";
import CallbackStore from "./CallbackStore";
import { closeDock, closeToolbar, forceHideDock, forceHideToolbar, forceOpenDock, forceOpenToolbar, getUser, getWorld, JamUser, JamWorld, Notif, openDock, openToolbar, selectForceHideDock, selectForceHideToolbar, selectForceOpenDock, selectForceOpenToolbar, selectIsDockOpen, selectIsToolbarOpen, selectNotifDuration, selectNotifs, selectUser, selectWorld, setNotification, setUser, toggleDock, toggleToolbar, signout, setWorld, _initialWorld, setWorldLoaded, loadOsFromString, setArgs, selectArgs, updateUserToken } from "./osSlice";

export interface SerializedData {
  proc?:string,
  files?:string,
  settings?:string,
  [key:string]:string|number|boolean,
}

export interface WorldInfo {
  uid: string;
  wid: string;
  rights: string;
  created_time: string;
  last_update_time: string;
}

export default class JamOS {
  public static get version() {return '0.2'};
  public static get procmgr() {return ProcMgr.getInstance()};
  public static get filemgr() {return FileMgr.getInstance()};
  public static get setmgr() {return SetMgr.getInstance()};
  public static get theme():Theme { return SetMgr.getInstance().themeReadable();}
  public static set(props){
    store.dispatch(setArgs(props));
  }
  public static getReadable(prop:string){
    return useAppSelector(selectArgs(prop));
  }
  public static getValue(prop:string){
    return store.getState().os.args[prop];
  }
  public static toggle(procId:string, prop:string){
    const retval = {};
    const val = JamOS.procmgr.getValue(procId, prop);
    if(!(typeof val === 'boolean' || val === undefined)){
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
    const notifsVal =  store.getState().os.notifs;
    const lastElem = notifsVal.at(notifsVal.length-1);
    const now = Date.now();
    if(notifsVal.length>0 && Math.abs(lastElem?.timestamp - now) < 50 && lastElem?.msg === msg){
      //ignore same msg within 50ms
      return;
    }
    const notif:Notif = {
      msg:msg, type:(type??'log'), timestamp:now
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
      os:JSON.stringify(store.getState().os),
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
      'os' : async (_data)=>{ await store.dispatch(loadOsFromString(_data)); },
    }
    try{
      for(let key in parsed){
        await cbs[key]?.(parsed[key]);
      }
    } catch(err){
      console.error(err);
    }
  }
  public static saveLocal(key:string,val:string){
    localStorage.setItem(key,val)
  }
  public static loadLocal(key:string):string{
    return localStorage.getItem(key);
  }
  private static _saveStringified(){
    console.log("saveStringified");
    JamOS.saveLocal("stringifiedJamOS",  JamOS.stringify());
  }
  private static _loadStringified(){
    console.log("loadStringified");
    const data = JamOS.loadLocal("stringifiedJamOS");
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
  public static isDockFixedValue(){
    return store.getState().os.openDock;
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
    const local = "http://localhost:3000/";
    const remote = "3.36.186.87"
    const server =
      process.env.NODE_ENV === "development"
        ? local
        : remote;
    
    // return remote;
    return server;
    
  }
  public static get apis() {
    const retval = {
      posts : "post", //get,post
      signup : "user/signup",  //post
      signin : "user/signin",  //post
      signincheck : "user/check",  //get
      refreshToken : 'user/refresh', //get
      worldList : 'world/list', //get
      worldCreate : 'world/create', // post 
      worldSave : 'world/data', //post
      worldLoad : 'world/data/', //get
      worldDelete : 'world/delete', //delete
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

  public static get authHeader ():{} {
    // const token = getCookie('accessToken');
    const token = this.userValue().token;
    return token ? { headers: {"Authorization" : `Bearer ${token}`}, withCredentials:true } : {withCredentials:true};
  }

  public static trySignin(userId:string, password:string, args?:{procId?:string, onSignin?:(msg:string)=>void, onError?:(msg:string)=>void}):void{


    if(!JamOS.isUserInfoValid(userId, password, args?.onError)){
      return;
    }

    JamOS.setLoading();
    // JamOS.setNotif(`Signing in as ${userId}...`);
    axios
      .post(JamOS.apis.signin, {user:userId, password:password}, this.authHeader)
      .then(async (res) => {
        // console.log("res:",res);
        const stat = res.status;
        const cont = res.data?.content;
        // console.log("Signin Status : " + stat + "Content : ", cont);
        const acc = cont["accessToken"];
        const ref = cont["refreshToken"];


        const signedIn = stat === 200 && acc && ref;
        if (signedIn) {
          JamOS.signin(userId, acc, ref);
          JamOS.setNotif(`Welcome ${userId}`, "success");
          args?.onSignin?.(`Welcome ${userId}`);
        } else {
          JamOS.setNotif("Failed to sign in as " + userId, "error");
          args?.onError?.("Failed to sign in as " + userId);
          // CallbackStore.getById(args?.errorCallbackId)?.();
          // JamOS.setNotif("Failed to sign in as " + userInput.user, "error");
        }
          JamOS.setLoading(false);
        })
        .catch((err) => {
          // console.log("Err:",err);
          const cont = err.response?.data?.message;
          if (cont) {
            JamOS.setNotif(cont);
            args?.onError?.(cont);
            // CallbackStore.getById(args?.errorCallbackId)?.();
          } else {
            JamOS.setNotif("Failed to sign in as " + userId, "error");
            args?.onError?.("Failed to sign in with unknown error code");
            // CallbackStore.getById(args?.errorCallbackId)?.();
          }
          JamOS.setLoading(false);
        });
  }

  public static get minIdLength() { return 3; }
  public static get maxIdLength() { return 12; }
  public static get minPasswordLength() { return 3; }
  public static get maxPasswordLength() { return 12; }

  public static isUserInfoValid(userId:string, password:string, onError?:(msg:string)=>void):boolean {
    if(!userId || userId.length<JamOS.minIdLength || userId.length>JamOS.maxIdLength){
      onError?.(`User id is not correct. Id must have at least ${JamOS.minIdLength} characters and cannot be more than ${JamOS.maxIdLength}.`);
      return false;
    }
    if(!password || password.length<JamOS.minIdLength || password.length>JamOS.maxIdLength){
      onError?.(`Password is not correct. Password must have at least ${JamOS.minPasswordLength} characters and cannot be more than ${JamOS.maxPasswordLength}.`);
      return false;
    }
    return true;
  }

  public static createWorld(wid:string, args?:{calledByProc?:string, onSuccess?:(msg:string)=>void, onError?:(msg:string)=>void}){
    JamOS.setLoading();
      axios
        .post(JamOS.apis.worldCreate, { wid: wid }, JamOS.authHeader)
        .then((res) => {
          // console.log("res:", res);
          const cont = res.data?.content;
          if (cont) {
            args?.onSuccess?.(`Successfully created world ${cont.wid} for ${cont.uid}`);
          } else {
            args?.onSuccess?.("Successfully created world");
          }
          JamOS.setLoading(false);
          if(args?.calledByProc){
            JamOS.worldList(args?.calledByProc);
          }
          return true;
        })
        .catch((err) => {
          console.error(err);
          const msg = err.response?.data?.message;
          if(err.response?.status === 401 && msg === 'jwt expired'){
            JamOS.setLoading(false)
            JamOS.refreshToken().then(_=>{
              JamOS.createWorld(wid, args);
            });
            return;
          }

          if (msg) {
            args?.onError?.(msg);
          } else {
            args?.onError?.("Unknown error occured. Please try again.");
          }
          JamOS.setLoading(false);
          return false;
        });
  }

  // procmgr.set(procId, { worldList:WorldInfo[] })
  public static worldList(procId?:string) {
    //user info is contained in JamOS.authHeader
    procId = procId ?? JamOS.procmgr.processesValue()?.find(proc=>proc.type==='worldeditor')?.id;
    if(!procId){
      return;
    }
    JamOS.setLoading(true);
    axios
    .get(JamOS.apis.worldList, JamOS.authHeader)
    .then((res) => {
      const worldList: WorldInfo[] = res.data?.content?.rows?.map((datum) => ({
        uid: datum.uid,
        wid: datum.wid,
        rights: datum.wid,
        created_time: datum.created_time,
        last_update_time: datum.last_update_time,
      }));
      // console.log("worldList:", worldList);
      // console.log("Initted : ", res.data?.initted);
      JamOS.setLoading(false);
      JamOS.procmgr.set(procId, { worldList: [...worldList] });
    })
    .catch((err) => {
      const msg = err.response?.data?.message;
      if(err.response?.status === 401 && msg === 'jwt expired'){
        JamOS.setLoading(false)
        JamOS.refreshToken().then(_=>{
          console.log("on refresh");
          JamOS.worldList(procId);
        });
        return;
      }
      JamOS.setLoading(false);
      console.error(err);
    });
  }

  public static trySignup(userId:string, password:string, args?:{signinAfterSignup?:boolean, procId?:string, onSignup?:(msg:string)=>void, onError?:(msg:string)=>void}):void {
    if(!JamOS.isUserInfoValid(userId, password, args?.onError)){
      return;
    }
    JamOS.setLoading();
    JamOS.setNotif(`Signing up as userId...`);

    axios
      .post(JamOS.apis.signup, {user:userId, password:password}, this.authHeader)
      .then(async (res) => {
        const stat = res.status;
        const cont = res.data?.content;
        if (stat === 200) {
          // JamOS.setNotif("Signed up as " + userInput.user);
    args?.onSignup?.("Signed up as " + userId);
          if (args?.procId)
            JamOS.procmgr.set(args.procId, { onSignupSuccess: true });
          if(args?.signinAfterSignup){
            setTimeout(()=>{
              JamOS.trySignin(userId, password, {...args})
            },100);
          }
        } else {
          if (cont) {
            args?.onError?.(cont);
            // JamOS.setNotif(cont, "error");
          } else {
            args?.onError?.("Failed to sign in as " + userId);
            // JamOS.setNotif("Failed to sign up as " + userInput.user, "error");
          }
        }
        JamOS.setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        const cont = err.response?.data?.content;
        if (cont) {
          args?.onError?.(cont);
        } else {
          args?.onError?.("Failed to sign up with unknown error code");
        }
        JamOS.setLoading(false);
      });
  };

  public static signin(userId:string, accessToken:string, refreshToken:string){
    const user:JamUser = {
      id : userId,
      signedin:true,
      token:accessToken
    }
    store.dispatch(setUser(user));
    JamOS.setWorld("__pending__")
    JamOS.saveLocal('refreshToken', refreshToken);
  }



  public static signout(){
    store.dispatch(signout());
    JamOS.format();
    JamOS.procmgr.killAll('system');
    JamOS.procmgr.add('jamhub', {isInitial:true});
    JamOS.closeDock();
    JamOS.openToolbar();
  }

  public static setWorld(wid:string, onLoad?:()=>void) {
    store.dispatch(setWorld(wid));
    if(onLoad){
      const cbid = 'system/World/onLoad'
      JamOS.set({onWorldLoad:cbid})
      CallbackStore.register('system/World/onload', onLoad);
    }
  }

  public static deleteWorld(wid?:string) {
    JamOS.setLoading();
    wid = wid ?? JamOS.worldValue().name;
    JamOS.setNotif(`Deleting ${wid}...`);
    const proc = JamOS.procmgr.processOfTypeValue('worldeditor');
    axios.delete(JamOS.apis.worldDelete, { data:{wid:wid}, ...this.authHeader}).then(res=>{
      // console.log(res);
      // console.log("wid:",wid,", res.data?.wid:",res.data?.wid);
      const content = res.data?.content
      if(content && wid && wid === content.wid){
        // console.log("deleteworld : proc",proc);
        if(proc){
          JamOS.toggle(proc.id, 'updateList');
        }
        JamOS.setNotif(`${wid} deleted`, 'success');
      } else {
        JamOS.setNotif(`Failed to delete ${wid}${res.data?.content ?? ""}`, 'error');
      }
      JamOS.setLoading(false);
      JamOS.worldList();
    }).catch(err=>{
      console.error(err);
      const msg = err.response?.data?.message;
      if(err.response?.status === 401 && msg === 'jwt expired'){
        JamOS.setLoading(false)
        JamOS.refreshToken();
        return;
      }
      JamOS.setLoading(false);
      JamOS.setNotif(`Failed to delete ${wid} : ${err}`, 'error');
      JamOS.worldList();
    });
  }

  public static saveWorld(type:SaveWorldType='whole'){
    // const saveable = this.userValue().signedin && this.worldValue().name !==_initialWorld.name;
    const saveable = this.userValue().signedin;
    if(!saveable){
      JamOS.setNotif(`Sign in first to save`, 'warn')
      return;
    }
    const wid = this.worldValue().name;
    JamOS.setNotif(`Saving ${wid}...`)
    JamOS.setLoading();

    const isWhole = type==='whole';
    const data = {};
    if(type==='file' || isWhole){
      data['file'] = JamOS.filemgr.stringify()
    }
    if(type==='proc' || isWhole){
      data['proc'] = JamOS.procmgr.stringify();
    }
    if(type==='setting' || isWhole){
      data['setting'] = JamOS.setmgr.stringify();
    }
    if(type==='os' || isWhole){
      const osData = store.getState().os;
      const retval = {};
      const skips = ['jamUser', 'jamWorld'];
      
      console.log("osData type : ", typeof(osData));
      console.log("osData : ", osData);

      for ( let key in osData){
        if(!skips.includes(key)){
          retval[key] = osData[key];
        }
      }
      // console.log("os data:",retval);
      data['os'] = JSON.stringify(retval);
    }
    const payload = {
      type:type,
      data:data,
      wid:wid
    }
    axios.post(this.apis.worldSave, payload, this.authHeader).then(res=>{
        // console.log(res);
      JamOS.setLoading(false);
      JamOS.setNotif(`${wid} saved`, 'success');
    }).catch(err=>{
      console.error(err);
      const msg = err.response?.data?.message;
          if(err.response?.status === 401 && msg === 'jwt expired'){
            JamOS.setLoading(false)
            JamOS.refreshToken();
            return;
          }
      JamOS.setLoading(false);
      JamOS.setNotif(`Faild to save ${wid} : ${err}`, 'error');
    })
  }
  public static setLoading(isLoading:boolean=true){
    JamOS.set({isLoading:isLoading});
  }
  public static isLoading(){
    return JamOS.getReadable('isLoading');
  }

  public static async loadOSFromString(data:string) {
    try {
      const parsed = await JSON.parse(data);
      store.dispatch(loadOsFromString(parsed));
      
    } catch (error) {
      console.error(error);
    }
  }

  public static loadWorld(wid?:string){
    wid = wid ?? this.worldValue().name;
    if(wid.length===0){
      wid = 'sample_world';
    }
    JamOS.setNotif(`Loading ${wid}...`)
    JamOS.setLoading();
    return axios.get(this.apis.worldLoad+wid,this.authHeader).then(res=>{
      const content = res.data?.content;
      console.log({res});
      const funcMap = {
        file:JamOS.filemgr.loadFromString,
        proc:JamOS.procmgr.loadFromString,
        setting:JamOS.setmgr.loadFromString,
        os:JamOS.loadOSFromString,
      }
      console.log("content[key]:",content['os']);
      for(let key in funcMap){
        if(content[key]){
          funcMap[key](content[key]);
        }
      }
    JamOS.setLoading(false);
    JamOS.setNotif(`${wid} loaded`, 'success');
  }).catch(err=>{
    console.error(err);
    const msg = err.response?.data?.message;
    if(err.response?.status === 401 && msg === 'jwt expired'){
      JamOS.setLoading(false)
      JamOS.refreshToken();
      return;
    }
    JamOS.setLoading(false);
    JamOS.setNotif(`Failed to load ${wid}`, 'error');
  });
  }

  public static format(){
    const home = JamOS.filemgr.dirValue('~');
    home.dirs.forEach(dir=>JamOS.filemgr.rmdir(dir.node.path));
    home.files.forEach(file=>JamOS.filemgr.rm(file.node.path));
  }

  public static setWorldLoaded(loaded:boolean=true){
    const world = JamOS.worldValue();
    if(world.loaded===loaded){
      //skip
    } else {
      store.dispatch(setWorldLoaded(loaded))
    }
  }
  public static async refreshToken(){
    const token = JamOS.loadLocal('refreshToken');
    if(!token){
      JamOS.setNotif("Session expired. Sign in again please.", 'error');
      return;
    }
    JamOS.setLoading();
    const config = {...JamOS.authHeader};
    if(config['headers']){
      config['headers'] = {...config['headers'], refresh:token}
    } else {
      config['headers'] = { refresh:token}
    }
    return axios.get(JamOS.apis.refreshToken, config).then(res=>{
      const acc = res.data?.content?.accessToken;
      if(acc){
        store.dispatch(updateUserToken(acc));
      } else {
        JamOS.setNotif("Session expired. Sign in again please.", 'error');
      }
      JamOS.setLoading(false);

    }).catch(err=>{
      console.error(err);
      // JamOS.setNotif()
      JamOS.setLoading(false);
    })
  }
}
export type SaveWorldType = 'whole' | 'os' | 'file' | 'proc' | 'setting';