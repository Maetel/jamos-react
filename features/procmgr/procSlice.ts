import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState, AppThunk } from '../../app/store'


import Process from "./ProcTypes";


export interface ProcState {
  procs:Process[]
}

const initialState: ProcState = {
  procs:[],
}

export const procSlice = createSlice({
  name:'proc',
  initialState,
  reducers:{
    addProc:(state, action:PayloadAction<Process>)=>{
      const actionId = action.payload.id;
      const sameFound = state.procs.find(proc=>proc.id===actionId);
      if(sameFound){
        throw new Error("Samd id process found");
      }
      state.procs.push(action.payload);
    },

    removeProc:(state, action:PayloadAction<string>)=>{
      state.procs.filter(proc=>proc.id!==action.payload)
    },

    increaseIndices:(state, action:PayloadAction<null>)=>{
      state.procs.forEach(proc=>{
        proc.zIndex = ''+(parseInt(proc.zIndex)+1);
        return proc
      })
    },

    setActiveWindow:(state, action:PayloadAction<string>)=>{
      const proc = state.procs.find(proc=>proc.id===action.payload)
      if(!proc){
        throw new Error(`setActiveWindow. could not find procId : ${action.payload}`);
      }
      const axis = parseInt(proc.zIndex);
      state.procs.forEach(proc=>{
        const idx = parseInt(proc.zIndex);
        if(idx < axis){
          proc.zIndex = ''+(idx+1);
        }
      })
      proc.zIndex = '0';
    },
  }
})

export const selectProcessById = createSelector([state=>state.procs, (state, procId:string)=>procId], (procs,procId)=>{
  return procs.find(proc=>proc.id===procId);
})

export const selectProcesses = (state:AppState)=>state.proc.procs;
export const selectProcInIndexOrder = (state:AppState)=>[...state.proc.procs].sort((l,r)=>{
  return parseInt(r.zIndex)-parseInt(l.zIndex);
});

export default procSlice.reducer;
export const { addProc, removeProc, increaseIndices, setActiveWindow} = procSlice.actions