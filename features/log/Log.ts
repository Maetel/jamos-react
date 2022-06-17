import store from "../../app/store";
import {log, warn, error, system, addLog} from "./logSlice";

export default class Log {
  static obj(obj:any) {
    console.log('[log]',obj);
    store.dispatch(log(JSON.stringify(obj)));
  }

  static log(msg:string){
    console.log('[log]'+msg);
    store.dispatch(log(msg))
  }
  static warn(msg:string){
    console.warn('[warning]'+msg);
    store.dispatch(warn(msg))
  }
  static error(msg:string){
    console.error('[error]'+msg);
    store.dispatch(error(msg))
  }
  static system(msg:string){
    console.info(`%c[system]${msg}`, 'color: green;');
    store.dispatch(system(msg))
  }
}