import { useSelector } from "react-redux";
import store from "../../app/store";
import { addError, addLog } from "../../scripts/Path";

import {
  addProc,
  increaseIndices,
  selectProcessById,
  selectProcesses,
  selectProcInIndexOrder,
  setActiveWindow,
} from "./procSlice";
import Process, { ProcessCommands } from "./ProcTypes";


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

  private _prepareNewWindow(){
    store.dispatch(increaseIndices());
  }

  public add(procType:string, args:{}={}){

    if(!ProcessCommands.includes(procType)){
      addError(`ProcessCommands does not include : ${procType}`)
      return this;
    }

    this._prepareNewWindow();

    const _id = this.getId;
    const proc:Process ={
      id:_id,
      comp:procType,
      name:`${procType} - id[${_id}]`,
      zIndex:'0',
      ...args
    }
    
    store.dispatch(addProc(proc));

    return this;
  }

  public get procs(){
    return useSelector(selectProcesses);
  }
  public get procsInOrder(){
    return useSelector(selectProcInIndexOrder);
  }

  public find(procId:string) {
    return this.procs.find(proc=>proc.id===procId);
  }

  //엄밀히 따지면 프로세스의 z-index는 별도의 어레이에 매핑되어 관리되는 것이 맞아보인다.
  public setActiveWindow(procId:string) {
    if(this.find(procId)?.zIndex==='0'){
      addLog('Already at the top. id : '+procId);
    }
    store.dispatch(setActiveWindow(procId));
  }
}