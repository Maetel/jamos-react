import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { WritableDraft } from 'immer/dist/internal';
import type { AppState, AppThunk } from '../../app/store'
import store from '../../app/store';
import { serializeToolbarItem, ToolbarItem, ToolbarItemId } from '../../scripts/ToolbarTypes';
import ProcMgr from './ProcMgr';


import Process, { ProcessCommands, Rect } from "./ProcTypes";


export interface ProcState {
  procs:Process[]
  openToolbar : boolean;
}

const initialState: ProcState = {
  procs:[],
  openToolbar:false,
}

export const procSlice = createSlice({
  name:'proc',
  initialState,
  reducers:{
    addProc:(state, action:PayloadAction<Process>)=>{
      if(!ProcessCommands.includes(action.payload.comp)){
        console.error('no such app : ',action.payload.comp)
        return;
      }

      const actionId = action.payload.id;
      const sameFound = state.procs.find(proc=>proc.id===actionId);
      if(sameFound){
        throw new Error("Same id process found error");
      }
      
      state.procs.push(action.payload);
    },

    killProc:(state, action:PayloadAction<string>)=>{
      const inputId = action.payload;
      const found = state.procs.find(proc=>proc.id===inputId);
      if(!found){
        return;
      }
      const axis = parseInt(found.zIndex);
      state.procs = state.procs.map(
        proc=>{
          if(parseInt(proc.zIndex) > axis){
            proc.zIndex = ''+(parseInt(proc.zIndex)-1);
          }
          return proc;
        }
      ).filter(proc=>proc.id !== inputId);
    },
    killAllProcs:(state, action:PayloadAction<string>)=>{
      if(action.payload){
        // console.warn(`Process [${action.payload}] called kill all processes.`)
      }
      state.procs = [];
    },

    increaseIndices:(state, action:PayloadAction<null>)=>{
      state.procs.forEach(proc=>{
        proc.zIndex = ''+(parseInt(proc.zIndex)+1);
        return proc
      })
    },

    setToolbarItem:(state, action:PayloadAction<{id:string,item:ToolbarItem}>)=>{
      const proc = state.procs.find(proc=>proc.id===action.payload.id)
      
      if(!proc){
        return;
      }
      const item = action.payload.item;
      const idx = proc.toolbar.map(_item=> ToolbarItemId(_item)).indexOf(ToolbarItemId(item))
      
      if(idx!==-1){
        proc['toolbar'][idx]=item;
      } else {
        proc['toolbar']=[...proc['toolbar'], item];
      }
    },

    setProcProps:(state, action:PayloadAction<{id:string,props:{}}>)=>{
      const proc = state.procs.find(proc=>proc.id===action.payload.id)
      
      if(!proc){
        return;
      }
      for(let key in action.payload.props){
        proc[key] = action.payload.props[key];

        //set along with key
        switch (key) {
          case 'rect':
            const isMaximized = ()=>(proc.rect.width === '100%' && proc.rect.height === '100%') || (proc.rect.width === `${window.innerWidth}px` && proc.rect.height === `${window.innerHeight}px`);
            proc.isMaximized = isMaximized();
            break;
        
          default:
            break;
        }
      }
    },
    openToolbar:(state, action:PayloadAction<void>)=>{
      state.openToolbar = true;
    },
    closeToolbar:(state, action:PayloadAction<void>)=>{
      state.openToolbar = false;
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
    
    toggleMaximize:(state, action:PayloadAction<string>)=>{
      const proc = state.procs.find(proc=>proc.id===action.payload);
      if(!proc){
        return;
      }
      if(!proc.rect){
        throw new Error("Win rect must exist");
      }
      // console.log(window.innerWidth, ',',window.innerHeight);
      const isMaximized = ()=>(proc.rect.width === '100%' && proc.rect.height === '100%') || (proc.rect.width === `${window.innerWidth}px` && proc.rect.height === `${window.innerHeight}px`);


      if(isMaximized()){
        //restore rect
        proc.rect = {...proc.prevRect};
        proc.isMaximized = isMaximized();
        return;
      }

      //maximize
      proc.prevRect = {...proc.rect};
      const max:Rect = {
        top:'0%',
        left:'0%',
        width:'100%',
        height:'100%'
      };
      for(let key in max){
        proc['rect'][key] = max[key]
      }
      console.log('togglemaximize rect:',{...proc.rect});
      proc.isMaximized = isMaximized();
    },

  },

  
})

export const selectIsToolbarOpen = (state:AppState)=>state.proc.openToolbar;

export const selectProcessById = createSelector([state=>state.procs, (state, procId:string)=>procId], (procs,procId)=>{
  return procs.find(proc=>proc.id===procId);
})

export const selectProcesses = (state:AppState)=>state.proc.procs;
export const selectProcInIndexOrder = (state:AppState)=>[...state.proc.procs].sort((l,r)=>{
  return parseInt(r.zIndex)-parseInt(l.zIndex);
});
export const selectProcProp = (id:string,prop:string)=>(state:AppState)=>{
  const proc = state.proc.procs.find(proc=>proc.id===id)
  return proc?.[prop]
}

export const processesValue = ()=>{
  return store.getState().proc.procs;
}

export default procSlice.reducer;
export const { addProc, killProc, killAllProcs, increaseIndices, setActiveWindow,setProcProps, toggleMaximize,setToolbarItem, openToolbar, closeToolbar} = procSlice.actions