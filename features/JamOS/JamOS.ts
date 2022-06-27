import FileMgr from "../file/FileMgr";
import ProcMgr from "../procmgr/ProcMgr";
import SetMgr from "../settings/SetMgr";
import { Theme } from "../settings/Themes";

export interface SerializedData {
  proc?:string,
  files?:string,
  settings?:string,
  [key:string]:string|number|boolean,
}


export default class JamOS {
  public static procmgr() {return ProcMgr.getInstance()};
  public static filemgr() {return FileMgr.getInstance()};
  public static setmgr() {return SetMgr.getInstance()};
  public static theme():Theme { return SetMgr.getInstance().themeReadable();}

  public static stringify():string{
    const retval:SerializedData = {
      proc:ProcMgr.getInstance().stringify(),
      files:FileMgr.getInstance().stringify(),
      settings:SetMgr.getInstance().stringify(),
    }
    return JSON.stringify(retval);
  }
  public static async loadFromString(data:string){
      console.log("JamOS load data :",data);
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

  
}