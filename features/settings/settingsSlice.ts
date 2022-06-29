import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import store, { AppState } from "../../app/store";
import officialThemes, { defaultTheme, ThemeColors } from "./Themes";



export interface SettingsState {
  theme:string,
  saveOnExit:boolean,
  askOnExit:boolean,
  [key:string]:any;
}

const initialState :SettingsState = {
  theme:"Forest",
  saveOnExit:true,
  askOnExit:false,
}

const settingsSlice = createSlice({
  name:'log',
  initialState,
  reducers:{
   
    setSetting:(state,action:PayloadAction<{}>)=>{
      for (let key in action.payload){
        state[key] = action.payload[key];
        // console.log(`Set setting : ${key} = ${action.payload[key]}`)
      }
    },
    toggleSetting:(state,action:PayloadAction<string>)=>{
      const key = action.payload;
      if(state[key]===undefined){
        console.error(`toggleSetting() key=${key} does not exists.`)
        for (let _key in state){
          console.error(` - state.settings[${_key}] : ${state[_key]}`)
        }
        return;
      } 
      if((typeof state[key])!=='boolean'){
        console.error(`toggleSetting() typeof ${key} is not boolean and not toggle-able. type was :${typeof state[key]}, value : ${state[key]}`)
        return;
      }
      state[key] = !state[key];
    },
    loadSettingsFromString:(state, action:PayloadAction<{}>)=>{
      console.warn("Load settings...")
      for(let key in state){
        // console.warn(' - deleting : ',key);
        delete state[key];
      }
      const loaded =action.payload;
      for ( let key in loaded){
        state[key] = loaded[key];
        // console.log(' - loading : ',key);
      }
      // console.warn("Load settings finished");
    }

  }
});

export const getSettingsValue = (key:string)=>store.getState().settings[key];
export const selectSettings = (key:string)=>(state:AppState)=>state.settings[key];
export const selectSettingsAll = (state:AppState)=>state.settings;
export const selectTheme = (state:AppState)=>state.settings.theme;
export const selectThemeColors = (state:AppState):ThemeColors=>officialThemes[state.settings.theme]?.colors ?? defaultTheme.colors;
export default settingsSlice.reducer;
export const { setSetting,loadSettingsFromString, toggleSetting } = settingsSlice.actions;