import { useSelector } from "react-redux";
import store from "../../app/store";

import {
  addProc,
  selectProcesses,
} from "./procSlice";
import { ProcCore, ProcData, Process } from "./ProcTypes";


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
    const datum = new ProcData(_id,{...args, dataId:_id});
    const proc = new Process(core, datum);
    store.dispatch(
    addProc(proc));

    return this;
  }

  public get procs(){

    return useSelector(selectProcesses);
  }
}