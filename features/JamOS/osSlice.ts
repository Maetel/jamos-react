import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import store, { AppState } from "../../app/store";


export interface Notif {
  msg:string,
  type: 'log' | 'warn' | 'error' | 'system',
}

export interface OSState {
  notifs:Notif[],
  notifDuration:number,
  [key:string]:any;
}

const initialState :OSState = {
  notifs:[],
  notifDuration:2000,
}

const osSlice = createSlice({
  name:'os',
  initialState,
  reducers:{
   
    setNotification:(state,action:PayloadAction<Notif>)=>{
      state.notifs.push(action.payload);
    },
  }
});

// export const getSettingsValue = (key:string)=>store.getState().settings[key];
// export const selectSettings = (key:string)=>(state:AppState)=>state.settings[key];

export const selectNotifDuration = (state:AppState):number=>state.os.notifDuration;
export const selectNotifs = (state:AppState):Notif[]=>state.os.notifs;
export default osSlice.reducer;
export const { setNotification } = osSlice.actions;