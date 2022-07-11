
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
  public static getById(callbackId:string){
    return this._callbacksById[callbackId];
  }
}