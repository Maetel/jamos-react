import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import store, { AppState } from "../../app/store";

export interface Log {
  content:string,
  type:'log'|'warn'|'error'|'system'
  time:string, //Date().toDatestring()
}

export interface LogState {
  logs:Log[]
}

const initialState :LogState = {
  logs:[]
}

const dateString = ()=>{return new Date().toDateString()}

const logSlice = createSlice({
  name:'log',
  initialState,
  reducers:{
    log:(state,action:PayloadAction<string>)=>{
      state.logs.push(<Log>{
        content:action.payload,
        type:'log',
        time:dateString()
      })
    },
    warn:(state,action:PayloadAction<string>)=>{
      state.logs.push(<Log>{
        content:action.payload,
        type:'warn',
        time:dateString()
      })
    },
    error:(state,action:PayloadAction<string>)=>{
      state.logs.push(<Log>{
        content:action.payload,
        type:'error',
        time:dateString()
      })
    },
    system:(state,action:PayloadAction<string>)=>{
      state.logs.push(<Log>{
        content:action.payload,
        type:'system',
        time:dateString()
      })
    },
    addLog:(state,action:PayloadAction<Log>)=>{
      state.logs.push(action.payload);
    }
  }
});

const _selectLog = (types:string[])=>{
  return ((state:AppState)=>state.log.logs.filter(log=>types.includes(log.type)))
}
export const selectLogAll = (state:AppState)=>state.log.logs;
export const selectLogError = _selectLog(['error']);
export const selectLogWarn = _selectLog(['warn']);
export const selectLogSystem = _selectLog(['system']);
export const selectLogImportant = _selectLog(['system', 'error']);

export const selectErrors = (state:AppState)=>state.log.logs.filter(log=>log.type==='error');

export default logSlice.reducer;
export const { log,warn,error,system,addLog } = logSlice.actions;