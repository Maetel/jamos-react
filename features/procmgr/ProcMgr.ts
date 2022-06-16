import { useSelector } from "react-redux";
import store from "../../app/store";

import {
  addProc,
  selectProcesses,
} from "./procSlice";
import Process from "./ProcTypes";


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
    const proc:Process ={
      id:_id,
      comp:procType,
      name:`${procType} - id[${_id}]`
    }
    store.dispatch(
    addProc(proc));

    return this;
  }

  public get procs(){
    return useSelector(selectProcesses);
  }
}