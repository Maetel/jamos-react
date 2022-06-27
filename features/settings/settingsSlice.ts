import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import store, { AppState } from "../../app/store";
import officialThemes, { defaultTheme, ThemeColors } from "./Themes";



export interface SettingsState {
  theme:string,
  [key:string]:any;
}

const initialState :SettingsState = {
  theme:"Forest",
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
    loadSettingsFromString:(state, action:PayloadAction<{}>)=>{
      console.warn("Load settings...")
      for(let key in state){
        console.warn(' - deleting : ',key);
        delete state[key];
      }
      const loaded =action.payload;
      for ( let key in loaded){
        state[key] = loaded[key];
        console.log(' - loading : ',key);
      }
      console.warn("Load settings finished");
    }

  }
});

export const getSettingsValue = (key:string)=>store.getState().settings[key];
export const selectSettings = (key:string)=>(state:AppState)=>state.settings[key];
export const selectTheme = (state:AppState)=>state.settings.theme;
export const selectThemeColors = (state:AppState):ThemeColors=>officialThemes[state.settings.theme]?.colors ?? defaultTheme.colors;
export default settingsSlice.reducer;
export const { setSetting,loadSettingsFromString } = settingsSlice.actions;