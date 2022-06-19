import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { dir } from "console";
import { WritableDraft } from "immer/dist/internal";
import store, { AppState } from "../../app/store";
import Path from "../../scripts/Path";
import Log from "../log/Log";
import { Dir, File, Node, NodeControl } from "./FileTypes";

export interface FileState {
  root:Dir,
}

const initialHomePath = '~';
const initialHomePathRefined = new Path(initialHomePath);
const initialHome:Dir = {
  dirs:[],
  files:[],
  node: NodeControl.build(initialHomePath,'dir')
};
const initialState :FileState = {
  root:{...initialHome},
  
}

const dateString = ()=>{return new Date().toDateString()}
const _verifyPath = (path:string)=>{
  if (!path.startsWith(initialHomePath)) {
    return false;
  }
  return true;
}

export const bfsDir = (from:WritableDraft<Dir>|Dir, to:string):WritableDraft<Dir>|Dir=>{
  if(Path.areSame(from.node.path, to)){
    return from;
  }
  return from.dirs.map(dir=>bfsDir(dir, to)).filter(dir=>dir!==undefined).at(0);
}

//slice internal use only
const findDir = (state:WritableDraft<FileState>, path:string):Dir|undefined=>{
  // return bfsDir(state.root, new Path(path));
  const query = new Path(path);
  const dir = state.root;
  if(!dir || query.isEmpty){
    return undefined;
  }

  return bfsDir(dir, path);
}

const log = console.log;
const fileSlice = createSlice({
  name:'files',
  initialState,
  reducers:{
    mkdir:(state,action:PayloadAction<string>)=>{
      const _path = action.payload;
      
      const _mkdir = (path:string)=>{
        const refined = new Path(path);
        if(!_verifyPath(path)){
          log(`Path must begin with '${initialHomePath}'`);
          return false;
        }
        if(findDir(state, path)){
          log(`Directory '${path}' already exists`)
          return true;
        }
        const parentPath = new Path(path).parent;
        if(!findDir(state, parentPath)){
          //make parent recursively
          _mkdir(parentPath);
        }

        const newDir: Dir = {
          node: NodeControl.build(path, 'dir'),
          dirs: [],
          files: [],
        };
        const parentDir = findDir(state, parentPath);
        parentDir.dirs.push(newDir);
      }

      _mkdir(_path);
    },   
  }
});

// selectors
export const selectHome = (state:AppState)=>state.file.root;
export const selectDirs = (state:AppState)=>{
  const root = state.file.root;
  const retval:Dir[] = [];
  const selectRecursively = (dir:Dir)=>{
    retval.push(dir);
    dir.dirs.forEach(dir=>selectRecursively(dir));
  }
  selectRecursively(root);
      return retval;
};
export const selectFiles = (state:AppState)=>{
  const root = state.file.root;
  const retval:File[] = [];
  const selectRecursively = (dir:Dir)=>{
    dir.files.forEach(file=>{retval.push(file)});
    dir.dirs.forEach(dir=>{
      dir.dirs.forEach(dir=>selectRecursively(dir))
    }
      );
      
    
  }
  selectRecursively(root);
      return retval;
};

export const selectDir = (path:string)=>((state:AppState)=>{
  return bfsDir(state.file.root, path);
})

export const selectFile = (path:string)=>((state:AppState)=>{
  return bfsDir(state.file.root, path)?.files.filter(file=>Path.areSame(file.node.path, path)).at(0);
})

export const dirExists = (path: string) =>!!bfsDir(store.getState().file.root, path);
export const fileExists = (path: string) =>!!bfsDir(store.getState().file.root, new Path(path).parent).files.filter(file=>Path.areSame(file.node.path, path)).at(0);

////////////////////////

export default fileSlice.reducer;
export const { mkdir } = fileSlice.actions;