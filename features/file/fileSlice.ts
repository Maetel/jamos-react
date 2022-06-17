import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
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

const bfs = (dir:Dir, query:Path)=>{
  if(!dir){
    return undefined;
  }
  if(Path.areSame(dir.node.path, query.path)){
    return dir;
  }
  return bfs(dir.dirs.reduce((prev,_dir)=>{
    if(prev!==undefined){
      return prev;
    }
    if(Path.areSame(_dir.node.path, query.path)){
      return _dir;
    }
    return undefined;
  },undefined), query);
}

const findDir = (state, path:string):Dir|undefined=>{
  return bfs(state.root, new Path(path));
}

const log = console.log;
const fileSlice = createSlice({
  name:'files',
  initialState,
  reducers:{
    mkdir:(state,action:PayloadAction<string>)=>{
      const _path = action.payload;
      
      if(0)
      {
        debugger;
        findDir(state, '~/');
      }

      const _mkdir = (path:string)=>{
        const refined = new Path(path);
        if(!_verifyPath(path)){
          log(`Path must not begin with '${initialHomePath}'`);
          return false;
        }
        if(findDir(state, path)){
          log(`Directory '${path}' already exists`)
          return true;
        }
        const parentPath = new Path(path).parent;
        if(!findDir(state, parentPath)){
          log("Parent not found. making parent path:"+ parentPath)
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
export const selectDir = createSelector([state=>state.file.dirs, (state, path:string)=>path], (dirs:Dir[], path:string)=>{
  return dirs.find(dir=>Path.areSame(dir.node.path,path))
})
export const selectFile = createSelector([state=>state.file.files, (state, path:string)=>path], (files:File[], path:string)=>{
  return files.find(file=>Path.areSame(file.node.path, path))
})


////////////////////////

export default fileSlice.reducer;
export const { mkdir } = fileSlice.actions;