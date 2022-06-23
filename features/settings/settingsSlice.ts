import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import store, { AppState } from "../../app/store";



export interface SettingsState {
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
    }
  }
});

export const getSettingsValue = (key:string)=>store.getState().settings[key];
export const selectSettings = (key:string)=>(state:AppState)=>state.settings[key];
export default settingsSlice.reducer;
export const { setSetting } = settingsSlice.actions;