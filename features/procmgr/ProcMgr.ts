import { useSelector } from "react-redux";
import store from "../../app/store";
import Path, { addError, addLog } from "../../scripts/Path";
import { selectFile } from "../file/fileSlice";

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

  public exeFile(path: Path, args?: { [key: string]: any }) {
    
    const f = selectFile(path.path)?.(store.getState())
    if (!f) {
      return;
    }
    this.exeCmd(f.node.exeCmd, { ...f.node.data, ...args, node: f.node });
  }

  public exeCmd(cmds: string, args?: { [key: string]: any }) {
    const _cmds = cmds.split(" ").filter((cmd) => cmd !== "" && cmd !== " ");
    const cmdCount = _cmds.length;
    if (cmdCount === 0) {
      return;
    }
    const cmd = _cmds.at(0);
    if (cmdCount === 1) {
      this.add(_cmds.at(0), args);
      return;
    }

    //parse commadnds that take path as the rest of the arguments
    switch (cmd) {
      case "finder":
      case "notepad":
      case "markdown":
      case "browser":
      case "viewer":
        const path = _cmds.slice(1).join(" ");
        this.add(cmd, { path: path, ...args });
        break;
      default:
        break;
    }
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
}