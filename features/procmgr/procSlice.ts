import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from '../../app/store'
import store from '../../app/store';
import {  ToolbarItem, ToolbarItemId } from '../../scripts/ToolbarTypes';


import Process, { ProcessCommands, Rect, runOnce, TotalCommands } from "./ProcTypes";


export interface ProcState {
  procs:Process[]
  
}

const initialState: ProcState = {
  procs:[],
  
}

//set children active recursively
const _setActiveWindow = (state, id:string)=>{
  const proc = state.procs.find(proc=>proc.id===id)
  if(!proc){
    return;
  }
  const axis = parseInt(proc.zIndex);
  state.procs.forEach(proc=>{
    const idx = parseInt(proc.zIndex);
    if(idx < axis){
      proc.zIndex = ''+(idx+1);
    }
  })
  proc.zIndex = '0';
  proc.children?.forEach(child=>{_setActiveWindow(state, child)})
}

const _killProc = (state, id:string)=>{
  if(!id){
    // a child might be killed already
    return;
  }
  const found = state.procs.find(proc=>proc.id===id);
  if(!found){
    return;
  }
  //kill children recursively
  found.children?.forEach(childProcId=>{
    _killProc(state, childProcId);
  })

  state.procs = state.procs.filter(proc=>proc.id!==id);
}

export const procSlice = createSlice({
  name:'proc',
  initialState,
  reducers:{
    addProc:(state, action:PayloadAction<Process>)=>{
      if(!TotalCommands.includes(action.payload.comp)){
        console.error('no such app : ',action.payload.comp)
        return;
      }

      //filter run-onces
      {
        const comp = action.payload.comp;
        if(runOnce.includes(comp)){
          const alreadyRunning = state.procs.find(proc=>proc.comp===comp);
          if(alreadyRunning){
            _setActiveWindow(state, alreadyRunning.id)
            return;
          }
        }
      }

      const actionId = action.payload.id;
      const sameFound = state.procs.find(proc=>proc.id===actionId);
      if(sameFound){
        throw new Error("Same id process found error. Requested id : " + actionId + ', Existing ids : '+ state.procs.map(proc=>proc.id).join(', '));
      }
      
      

      //if is a child proc
      const parentId = action.payload.parent;
      if(parentId){
        const parentProc = state.procs.find(proc=>proc.id===parentId);
        if(!parentProc){
          // Tried to add child proc of non-existing parent.
          throw new Error(`Tried to add child proc of non-existing parent. Parent:${parentId}, Child(this):${actionId}`)
        }
        parentProc.children = parentProc.children ? [...parentProc.children, actionId] : [actionId];
      }

      //then finally add self
      state.procs.push(action.payload);
    },

    killAllofType:(state, action:PayloadAction<string>)=>{
      const inputType = action.payload;
      const killIds = [];
      state.procs.forEach(proc=>{
        if(proc.comp===inputType){
          killIds.push(proc.id);
        }
      })
      killIds.forEach(id=>{
        _killProc(state, id);
      })
      
      //squeez index
      state.procs = [...state.procs].sort((l,r)=>parseInt(l.zIndex)-parseInt(r.zIndex)).map((proc, i)=>({...proc, zIndex:''+i}));
    },
    

    killProc:(state, action:PayloadAction<string>)=>{
      
      const inputId = action.payload;
      const found = state.procs.find(proc=>proc.id===inputId);
      if(!found || found.comp==='system'){
        return;
      }

      _killProc(state, inputId);

      //squeez index
      state.procs = [...state.procs].sort((l,r)=>parseInt(l.zIndex)-parseInt(r.zIndex)).map((proc, i)=>({...proc, zIndex:''+i}));

    },
    killAllProcs:(state, action:PayloadAction<string>)=>{
      if(action.payload){
        // console.warn(`Process [${action.payload}] called kill all processes.`)
      }
      //kill all excluding system
      state.procs = state.procs.filter(proc=>proc.comp==='system');
    },

    increaseIndices:(state, action:PayloadAction<null>)=>{
      state.procs.forEach(proc=>{
        proc.zIndex = ''+(parseInt(proc.zIndex)+1);
        return proc
      })
    },

    removeToolbarItem:(state, action:PayloadAction<{id:string,menu:string,item:string}>)=>{
      const proc = state.procs.find(proc=>proc.id===action.payload.id)
      if(!proc){
        return;
      }
      const menu = action.payload.menu;
      const item = action.payload.item;
      proc.toolbar = proc.toolbar.filter(_item=>_item.menu===menu && _item.item===item);
    },

    removeAllToolbarItems:(state, action:PayloadAction<string>)=>{
      const proc = state.procs.find(proc=>proc.id===action.payload)
      if(!proc){
        return;
      }
      proc.toolbar=[];
    },
      
    
    updateToolbarItem:(state, action:PayloadAction<{id:string,from:ToolbarItem,to:ToolbarItem}>)=>{
      const proc = state.procs.find(proc=>proc.id===action.payload.id)
      if(!proc){
        return;
      }
      const from = action.payload.from;
      const to = action.payload.to;
      const foundIdx = proc.toolbar.findIndex(_item=>ToolbarItemId(_item)===ToolbarItemId(from));
      if(foundIdx!==-1){
        proc.toolbar[foundIdx] = {...to};
      }
    },

      addToolbarItem:(state, action:PayloadAction<{id:string,item:ToolbarItem}>)=>{
      const proc = state.procs.find(proc=>proc.id===action.payload.id)
      if(!proc){
        return;
      }
      const item = action.payload.item;
      const idx = proc.toolbar.map(_item=> ToolbarItemId(_item)).indexOf(ToolbarItemId(item))
      
      const idxFound = idx!==-1;
      if(idxFound){
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
    
    setActiveWindow:(state, action:PayloadAction<string>)=>{
      //return if already at front
      if(state.procs.find(proc=>proc.id===action.payload)?.zIndex==='0'){
        return;
      }
      _setActiveWindow(state,action.payload);
    },
    
    unMinimize:(state, action:PayloadAction<string>)=>{
      const _unMinimize = (id:string)=>{
        const proc = state.procs.find(proc=>proc.id===id);
        if(!proc){
          return;
        }
        proc.isMinimized = false;
        proc.children?.forEach(child=>{_unMinimize(child);})
      }
      _unMinimize(action.payload);
    },
    minimize:(state, action:PayloadAction<string>)=>{
      const _minimize = (id:string)=>{
        const proc = state.procs.find(proc=>proc.id===id);
        if(!proc){
          return;
        }
        proc.isMinimized = true;
        proc.children?.forEach(child=>{_minimize(child);})
      }
      _minimize(action.payload);
    },

    toggleMinimize:(state, action:PayloadAction<string>)=>{
      const proc = state.procs.find(proc=>proc.id===action.payload);
      if(!proc){
        return;
      }
      // okay even if proc.isMinimized is undefined
      proc.isMinimized = !proc.isMinimized;
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
      {
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
      }
      
      proc.isMaximized = isMaximized();
    },

    
    pushToLast:(state, action:PayloadAction<string>)=>{
      const proc = state.procs.find(proc=>proc.id===action.payload);
      if(!proc){
        return;
      }
      const axis = parseInt(proc.zIndex);
      const procCount = state.procs.length;
      state.procs.forEach(_proc=>{
        if(axis < parseInt(_proc.zIndex)){
          _proc.zIndex = ''+(parseInt(_proc.zIndex)-1)
        }
      })
      proc.zIndex = ''+(procCount-1);
    },
    
    loadProcFromString:(state, action:PayloadAction<{}>)=>{
      console.warn("Load process...")
      for(let key in state){
        // console.warn(' - deleting : ',key);
        delete state[key];
      }
      const loaded =action.payload;
      for ( let key in loaded){
        state[key] = loaded[key];
        // console.log(' - loading : ',key);
      }
      // console.warn("Load process finished");
    }
  },

  
})



// export const selectProcessById = createSelector([state=>state.procs, (state, procId:string)=>procId], (procs,procId)=>{
//   return procs.find(proc=>proc.id===procId);
// })
export const selectProcessById = (id:string)=>(state:AppState)=>{
  return state.proc.procs.find(proc=>proc.id===id);
}

export const selectProcesses = (state:AppState)=>state.proc.procs;
export const selectProcInIndexOrder = (state:AppState)=>[...state.proc.procs].sort((l,r)=>{
  return parseInt(r.zIndex)-parseInt(l.zIndex);
});
export const selectProcProp = (id:string,prop:string)=>(state:AppState)=>{
  const proc = state.proc.procs.find(proc=>proc.id===id)
  return proc?.[prop]
}

export const processesValue = ():Process[]=>{
  return [...store.getState().proc.procs];
}
export const selectGroupedProcs = (state:AppState)=>{
  const procs:Process[] = state.proc.procs;
    const grouped:{[key:string]:Process[]} = procs.reduce((prev,proc)=>{
      if(!prev[proc.comp]) {
        prev[proc.comp] = [];
      }
      prev[proc.comp].push(proc)
      return prev;
    },{});

    //sort
    for(let key in grouped){
      grouped[key].sort((l,r)=>{return parseInt(l.zIndex) - parseInt(r.zIndex)})
    }
    return grouped;
}
export const selectGroupedProcsForDock = (state:AppState)=>{
  const procs:Process[] = state.proc.procs;
    const grouped:{[key:string]:Process[]} = procs.reduce((prev,proc)=>{
      if(proc.hideOnDock){
        return prev;
      }
      if(!prev[proc.comp]) {
        prev[proc.comp] = [];
      }
      prev[proc.comp].push(proc)
      return prev;
    },{});

    //sort
    for(let key in grouped){
      grouped[key].sort((l,r)=>{return parseInt(l.zIndex) - parseInt(r.zIndex)})
    }
    // console.log("selectGroupedProcsForDock, grouped:",grouped);
    return grouped;
}

export const selectIsMinimized = (procId:String)=>(state:AppState)=>{
  return state.proc.procs.find(proc=>proc.id===procId)?.isMinimized
}
export const selectFront = (state:AppState):Process=>{
  return state.proc.procs.find(proc=>proc.zIndex==='0')
}

function topParent (state:AppState, proc:Process):Process{
  let retval :Process = undefined;
  const findParent = (_proc:Process)=>{
    const parentFound =state.proc.procs.find(_p=>_p.id===_proc?.parent);
    if(parentFound){
      retval = parentFound;
      findParent(retval);
    }
  }
  findParent(proc);
  return retval;
}
export const selectFrontsParent = (state:AppState):Process=>{
  const front = state.proc.procs.find(proc=>proc.zIndex==='0');
  return topParent(state, front);
}

export const selectProcessOfType = (procType:String)=>(state:AppState)=>{
  return state.proc.procs.reduce((prev,next)=>{
    if(next.comp===procType){
      prev.push(next);
    }
    return prev;
  },[]);
}


export default procSlice.reducer;
export const { addProc, killProc, killAllProcs, increaseIndices, setActiveWindow,setProcProps, minimize, unMinimize,toggleMinimize,toggleMaximize,addToolbarItem, removeToolbarItem, removeAllToolbarItems, updateToolbarItem, pushToLast, loadProcFromString, killAllofType, } = procSlice.actions