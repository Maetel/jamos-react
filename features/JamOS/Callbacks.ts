
type Callback = (params?)=>any;
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

  private static _debug:boolean = !true;
  private static _callbacksById:{[key:string]:Callback} = {};
  public static get callbacks() { return this._callbacksById; }
  public static registerById(callbackId:string, cb:Callback){
    this._callbacksById[callbackId] = cb;

    if(this._debug)
    {
      console.log("Register callbackId:",callbackId,", this._callbacksById[callbackId]:",this._callbacksById[callbackId])
    }
    return this;
  }
  public static unregisterById(callbackId:string){
    if(!callbackId || callbackId.length===0){
      return;
    } 
    if(this._debug){

      console.log('Unregister:',callbackId,", delete:",this._callbacksById[callbackId]);
    }
    delete this._callbacksById[callbackId];
    return this;
  }
  public static unregisterByIds(callbackIds:string[]){
    if(!callbackIds){
      return;
    }
    callbackIds.forEach(id=>this.unregisterById(id));
    return this;
  }
  public static getById(callbackId:string){
    return this._callbacksById[callbackId];
  }
}