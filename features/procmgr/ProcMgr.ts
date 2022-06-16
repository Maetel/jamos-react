import { useAppDispatch } from "../../app/hooks";
import store from "../../app/store";

import {
  addProc,
  ProcCore,
  ProcData,
  Process,
  selectProcesses,
} from "./procSlice";


export default class ProcMgr{
  private static instance:ProcMgr;
  private constructor(){}
  public static getInstance():ProcMgr{
    if(!this.instance){
      this.instance = new ProcMgr();
    }
    return this.instance;
  }
  private id=1;
  private get getId(){
    return ''+this.id++;
  }
  public add(procType:string, args:{}={}){
    const _id = this.getId;
    const core = new ProcCore(_id, procType);
    const datum = new ProcData(_id,args);
    const proc = new Process(core, datum);
    console.log("Add, proc:",proc);
    store.dispatch(
    addProc(proc));

    return this;
  }
}