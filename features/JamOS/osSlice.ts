import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import store, { AppState } from "../../app/store";


export interface Notif {
  msg:string,
  type: 'log' | 'warn' | 'error' | 'system',
}

export interface OSState {
  openToolbar : boolean;
  openDock : boolean;
  forceHideToolbar : boolean;
  forceHideDock : boolean;
  forceOpenToolbar : boolean;
  forceOpenDock : boolean;

  notifs:Notif[],
  notifDuration:number,
  [key:string]:any;
}

const initialState :OSState = {
  openToolbar:false,
  openDock:false,
  forceHideToolbar : false,
  forceHideDock : false,
  forceOpenToolbar : false,
  forceOpenDock : false,

  notifs:[],
  notifDuration:4000,
}

const osSlice = createSlice({
  name:'os',
  initialState,
  reducers:{
   
    setNotification:(state,action:PayloadAction<Notif>)=>{
      state.notifs.push(action.payload);
    },

    openToolbar:(state, action:PayloadAction<void>)=>{
      state.openToolbar = true;
    },
    closeToolbar:(state, action:PayloadAction<void>)=>{
      state.openToolbar = false;
    },
    forceHideToolbar:(state, action:PayloadAction<boolean>)=>{
      state.forceHideToolbar = action.payload;
    },
    forceOpenToolbar:(state, action:PayloadAction<boolean>)=>{
      state.forceOpenToolbar = action.payload;
    },
    toggleToolbar:(state, action:PayloadAction<void>)=>{
      state.openToolbar = !state.openToolbar;
    },

    openDock:(state, action:PayloadAction<void>)=>{
      state.openDock = true;
    },
    closeDock:(state, action:PayloadAction<void>)=>{
      state.openDock = false;
    },
    forceHideDock:(state, action:PayloadAction<boolean>)=>{
      state.forceHideDock = action.payload;
    },
    forceOpenDock:(state, action:PayloadAction<boolean>)=>{
      state.forceOpenDock = action.payload;
    },
    toggleDock:(state, action:PayloadAction<void>)=>{
      state.openDock = !state.openDock;
    },
  }
});


export const selectIsToolbarOpen = (state:AppState)=>state.os.openToolbar;
export const selectIsDockOpen = (state:AppState)=>state.os.openDock;
export const selectForceOpenToolbar = (state:AppState)=>state.os.forceOpenToolbar;
export const selectForceOpenDock = (state:AppState)=>state.os.forceOpenDock;
export const selectForceHideToolbar = (state:AppState)=>state.os.forceHideToolbar;
export const selectForceHideDock = (state:AppState)=>state.os.forceHideDock;

export const selectNotifDuration = (state:AppState):number=>state.os.notifDuration;
export const selectNotifs = (state:AppState):Notif[]=>state.os.notifs;
export default osSlice.reducer;
export const { setNotification, openToolbar, closeToolbar, toggleToolbar, openDock, closeDock,toggleDock,forceHideToolbar, forceHideDock,forceOpenToolbar, forceOpenDock, } = osSlice.actions;