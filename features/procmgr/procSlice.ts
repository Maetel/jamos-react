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
    }
  }
})

export const selectProcessById = createSelector([state=>state.procs, (state, procId:string)=>procId], (procs,procId)=>{
  return procs.find(proc=>proc.id===procId);
})

export const selectProcesses = (state:AppState)=>state.proc.procs;

export default procSlice.reducer;
export const { addProc, removeProc} = procSlice.actions