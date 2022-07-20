import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import store, { AppState } from "../../app/store";


export interface Notif {
  msg:string,
  type: 'log' | 'success' | 'warn' | 'error' | 'system',
  timestamp:number, //Date.now()
}

export interface JamUser {
  id : string,
  signedin:boolean,
  token? : string,
}

export interface JamWorld {
  name:string,
  loaded?:boolean,
}

export interface OSState {
  jamUser : JamUser;
  jamWorld : JamWorld;

  openToolbar : boolean;
  openDock : boolean;
  forceHideToolbar : boolean;
  forceHideDock : boolean;
  forceOpenToolbar : boolean;
  forceOpenDock : boolean;

  notifs:Notif[],
  notifDuration:number,

  args:{},
  [key:string]:any;
}

export const _initialUser:JamUser = {id:'guest', signedin:false};
export const _initialWorld:JamWorld = {name:'__pending__', loaded:false}
const initialState :OSState = {
  jamUser : {..._initialUser},
  jamWorld : {..._initialWorld},

  openToolbar:false,
  openDock:false,
  forceHideToolbar : false,
  forceHideDock : false,
  forceOpenToolbar : false,
  forceOpenDock : false,

  notifs:[],
  notifDuration:4000,

  args:{},
}

const osSlice = createSlice({
  name:'os',
  initialState,
  reducers:{
   
    setUser:(state,action:PayloadAction<JamUser>)=>{
      const user:JamUser = action.payload;
      state.jamUser = {...user};
      // state.jamWorld.name = user.id+"-world";
    },

    setWorld:(state,action:PayloadAction<string>)=>{
      state.jamWorld.name = action.payload;
    },
    setWorldLoaded:(state,action:PayloadAction<boolean>)=>{
      state.jamWorld.loaded = action.payload;
    },

    signout:(state,action:PayloadAction<void>)=>{
      state.jamUser = {..._initialUser};
      state.jamWorld = {..._initialWorld};
    },

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
    setArgs:(state, action:PayloadAction<{}>)=>{
      state.args = {...state.args, ...action.payload};
    },

    loadOsFromString:(state, action:PayloadAction<{}>)=>{
      console.warn("Load os params...")
      if(0){
        for(let key in state){
          // console.warn(' - deleting : ',key);
          delete state[key];
        }
      }
      
      const loaded =action.payload;
      for ( let key in loaded){
        state[key] = loaded[key];
        // console.log(' - loading : ',key);
      }
      // console.warn("Load files finished");
    }
  }
});


export const getUser = ():JamUser=>store.getState().os.jamUser;
export const getWorld = ():JamWorld=>store.getState().os.jamWorld;
export const selectUser = (state:AppState)=>state.os.jamUser;
export const selectWorld = (state:AppState)=>state.os.jamWorld;
export const selectIsToolbarOpen = (state:AppState)=>state.os.openToolbar;
export const selectIsDockOpen = (state:AppState)=>state.os.openDock;
export const selectForceOpenToolbar = (state:AppState)=>state.os.forceOpenToolbar;
export const selectForceOpenDock = (state:AppState)=>state.os.forceOpenDock;
export const selectForceHideToolbar = (state:AppState)=>state.os.forceHideToolbar;
export const selectForceHideDock = (state:AppState)=>state.os.forceHideDock;

export const selectNotifDuration = (state:AppState):number=>state.os.notifDuration;
export const selectNotifs = (state:AppState):Notif[]=>state.os.notifs;
export const selectArgs = (prop:string)=>(state:AppState)=>state.os.args[prop];
export default osSlice.reducer;
export const { setNotification, openToolbar, closeToolbar, toggleToolbar, openDock, closeDock,toggleDock,forceHideToolbar, forceHideDock,forceOpenToolbar, forceOpenDock, setUser, setWorld, setWorldLoaded, signout, loadOsFromString, setArgs } = osSlice.actions;