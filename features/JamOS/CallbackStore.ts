import JamOS from "./JamOS";

type Callback = (params?)=>any;
type Callbacks = {[key:string]: Callback};

// callback format : procId/verb/details
// ex) system/ContextMenu/Open
//     1/FileDialogue/Save
export default class CallbackStore {
  private static _debug:boolean = !true;
  private static _callbacksById:{[key:string]:Callback} = {};
  public static get callbacks() { return this._callbacksById; }
  public static register(callbackId:string, cb:Callback){
    this._callbacksById[callbackId] = cb;

    if(this._debug)
    {
      console.log("Register callbackId:",callbackId,", this._callbacksById[callbackId]:",this._callbacksById[callbackId])
    }
    return this;
  }
  public static unregister(callbackId:string){
    if(!callbackId || callbackId.length===0){
      return;
    } 
    if(this._debug){
      console.log('Unregister:',callbackId,", delete:",this._callbacksById[callbackId]);
    }
    delete this._callbacksById[callbackId];
    return this;
  }
  public static unregisterIDs(callbackIds:string[]){
    if(!callbackIds){
      return;
    }
    callbackIds.forEach(id=>this.unregister(id));
    return this;
  }
  public static unregisterByProcID(procId:string){
    const keys=[];
    for ( let key in this._callbacksById){
      if(key.startsWith(`${procId}/`)){
        keys.push(key);
      }
    }
    keys.forEach(key=>{
      this.unregister(key);
    })
  }

  private static systemCallbackBuilder(callback:string){
    console.log("callback:",callback);
    const args = callback.split('/');
    if(args.at(0)!=='system'){
      return;
    }
    if(args.at(1)==='Toolbar'){
      const verb = args.at(2);
      const param = args.at(3);
      const p = JamOS.procmgr;
      switch (verb) {
        case 'add':
          return ()=> {p.add(param)};
        case 'kill':
          return ()=>{p.kill(param)};
        case 'killall':
          return ()=>{p.killAll(param)};
        case 'toolbar':
          if(param==='open'){
            return ()=>{JamOS.openToolbar()}
          } else {
            return ()=>{JamOS.closeToolbar()}
          }
        case 'dock':
          if(param==='open'){
            return ()=>{JamOS.openDock()}
          } else {
            return ()=>{JamOS.closeDock()}
          }
        default:
          break;
      }
      return;
    }
  }

  public static getById(callbackId:string){
    if(!callbackId){
      return undefined;
    }
    if(callbackId.startsWith('system/Toolbar')){
      return this.systemCallbackBuilder(callbackId);
    }
    return this._callbacksById[callbackId];
  }
}