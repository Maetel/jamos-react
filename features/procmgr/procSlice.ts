import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState, AppThunk } from '../../app/store'


export class Process {
  static empty(){
    return new Process(
      ProcCore.empty(),
      ProcData.empty(),
    )
  }
  isEmpty() {return this.core.isEmpty()};

  //public core:ProcCore;
  public data:ProcData;
 constructor(public core:ProcCore, data?:ProcData){
   this.data = data || new ProcData(core.id);
 }
}
export class ProcCore {
  static empty() {
    return new ProcCore('','');
  }
  isEmpty(){return this.id===''}
  // node?:Node;
  name:string = 'untitled process';

  status: 'new' | 'ready' | 'running' | 'sleep' | 'terminated' = 'new';
  public stringify():string {
    throw new Error("Not implemented");
  }
  
  constructor(public id:string, public comp:string, public onMount?:(string)=>void){}
}
export class ProcData {
  static empty(){return new ProcData('')}
  constructor(public id:string, public data:{}={}){}
  
  isEmpty(){return this.id===''}
}


export interface ProcState {
  procCore: ProcCore[]
  procData : ProcData[]
}

const initialState: ProcState = {
  procCore: [],
  procData:[],
}

export const procSlice = createSlice({
  name:'proc',
  initialState,
  reducers:{
    addProc:(state, action:PayloadAction<Process>)=>{
      const actionId = action.payload.core.id;

      const sameFound = state.procCore.find(core=>core.id===actionId);
      if(sameFound){
        throw new Error("Samd id process found");
      }

      //handle data
      const dataFoundIndex = state.procData.findIndex(data=>data.id===actionId);
      if(dataFoundIndex===-1){
      state.procData.push(action.payload.data);
      } else {
      state.procData[dataFoundIndex] = action.payload.data
      }

      //handle core
      state.procCore.push(action.payload.core);

      
    },

    removeProc:(state, action:PayloadAction<string>)=>{
      state.procData.filter(data=>data.id!==action.payload)
      state.procCore.filter(proc=>proc.id!==action.payload);
    }
  }
})

export const selectProcessCoreById = createSelector([state=>(state.proc as ProcState).procCore, (state, procId:string)=>procId], (cores,procId)=>{
  return cores.find(core=>core.id===procId);
})
export const selectProcessDataById = createSelector([state=>(state.proc as ProcState).procData, (state, procId:string)=>procId], (data,procId)=>{
  return data.find(datum=>datum.id===procId);
})

export const selectProcessById = createSelector([state=>state.proc as ProcState, (state, procId:string)=>procId], (proc,procId)=>{
  const core = proc.procCore.find(core=>core.id===procId);
  const data = proc.procData.find(data=>data.id===procId);

  if(core && data){
    return new Process(core,data);
  }
  return Process.empty();
})

export const selectProcesses = (state:AppState)=>{
  const _ = (state.proc as ProcState);
  return <Process[]>_.procCore.map(
    core=>{
      return new Process(core, _.procData.find(datum=>datum.id===core.id))
    }
  )
};
export const selectProcCore = (state:AppState)=>((state.proc as ProcState).procCore);
export const selectProcData = (state:AppState)=>((state.proc as ProcState).procData);

export default procSlice.reducer;
export const { addProc, removeProc} = procSlice.actions