
type Callback = (params)=>any;
type Callbacks = {[key:string]: Callback};
export default class CallbackStore {
  private static _callbacks:{[key:string]:Callbacks} = {};
  public static register(procId:string, callbackKey:string, cb:Callback){
    if(!this._callbacks[procId]){
      this._callbacks[procId]={};
    }
    this._callbacks[procId][callbackKey] = cb;
    return this;
  }
  public static unregister(procId:string, callbackKey?:string){
    if(callbackKey===undefined){
      delete this._callbacks[procId];
    } else {
      if(this._callbacks[procId]){
        delete this._callbacks[procId][callbackKey];
      }
    }
    return this;
  }
  public static get(procId, callbackKey:string){
    return this._callbacks[procId]?.[callbackKey];
  }

  private static _callbacksById:{[key:string]:Callback} = {};
  public static registerById(callbackId:string, cb:Callback){
    this._callbacksById[callbackId] = cb;
  }
  public static unregisterById(callbackId:string){
    delete this._callbacksById[callbackId];
  }
  public static getById(callbackId:string){
    return this._callbacksById[callbackId];
  }
}