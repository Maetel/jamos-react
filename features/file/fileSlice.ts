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
const findDir = (state:WritableDraft<FileState>, path:string):WritableDraft<Dir>|Dir=>{
  // return bfsDir(state.root, new Path(path));
  const query = new Path(path);
  const dir = state.root;
  if(!dir || query.isEmpty){
    return undefined;
  }

  return bfsDir(dir, path);
}
const findFile = (state:WritableDraft<FileState>, path:string):WritableDraft<File>|File=>{
  const p = new Path(path);
  return findDir(state, p.parent)?.files.find(file=>Path.areSame(file.node.path, path))
}

const _rm = (state,path:string)=>{
  const p = new Path(path);
  const f = findFile(state, p.path);
  if(!f){
    log(`Failed to remove file. No file : '${p.path}'`);
    return;
  }
  //parent dir must exist by here
  const parent = findDir(state, p.parent);
  parent.files = parent.files.filter(file=>!Path.areSame(file.node.path, p.path));
}
const _rmdir=(state, dir:Dir|WritableDraft<Dir>, path:Path)=>{
  if(!dir || path.isEmpty || path.isHome){
    return false;
  }
  dir.files.forEach(f=>_rm(state, f.node.path));
  dir.dirs.forEach(_dir=>_rmdir(state, _dir,new Path( _dir.node.path)));

  const parent = findDir(state, path.parent);
  parent.dirs = parent.dirs.filter(dir=>!Path.areSame(dir.node.path, path.path));
  return true;
}

const _mkdir = (state, path:string)=>{
  const refined = new Path(path);
  if(!_verifyPath(path)){
    // log(`Path must begin with '${initialHomePath}'`);
    return false;
  }
  if(findDir(state, path)){
    // log(`Directory '${path}' already exists`)
    return true;
  }
  const parentPath = new Path(path).parent;
  if(!findDir(state, parentPath)){
    //make parent recursively
    _mkdir(state, parentPath);
  }

  const newDir: Dir = {
    node: NodeControl.build(path, 'dir'),
    dirs: [],
    files: [],
  };
  const parentDir = findDir(state, parentPath);
  parentDir.dirs.push(newDir);
}


const log = console.log;
const fileSlice = createSlice({
  name:'files',
  initialState,
  reducers:{
    mkdir:(state,action:PayloadAction<string>)=>{
      const _path = action.payload;
      if(dirExists(_path)){
        return;
      }
      _mkdir(state, _path);
    },   
    addFile:(state,action:PayloadAction<File>)=>{
      const _path = action.payload.node.path;
      const refined = new Path(_path);
      if(!_verifyPath(refined.path)){
        log(`Path must begin with '${initialHomePath}'`);
        return;
      }
      // const parent = findDir(state, refined.parent);
      // if(!parent){
      //   log(`Parent directory not found : '${refined.path}'`);
      //   return;
      // }
      _mkdir(state, refined.parent);
      const parent = findDir(state, refined.parent);
      if(parent.files.some(file=>Path.areSame(file.node.path ,refined.path))){
        log(`File already exists : '${refined.path}'`);
        return;
      }

      //then finally add
      parent.files.push(action.payload);
    },
    rm : (state,action:PayloadAction<string>)=>{
      _rm(state, action.payload);
    },
    rmdir : (state,action:PayloadAction<string>)=>{
      //pass

      //delete recursively
      
      const path = action.payload;
      const dir = findDir(state, path);
      if(!dir){
        //no such directory
        return;
      }
      _rmdir(state, dir, new Path(path));
    }
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


export const selectNode = (path:string)=>((state:AppState)=>{
  const dir = bfsDir(state.file.root, path);
  if(dir){
    return dir.node;
  }
  const file = bfsDir(state.file.root, new Path(path).parent).files.find(file=>file.node.path===path);
  return file?.node;
})

export const selectNodesInDir = (path:string)=>((state:AppState)=>{
  const dir = bfsDir(state.file.root, path);
  if(!dir){
    return;
  }
  const nodes:Node[] = [];
  dir.dirs.forEach(dir=>{nodes.push(dir.node)});
  dir.files.forEach(file=>{nodes.push(file.node)});
  return nodes;
})
export const selectDir = (path:string)=>((state:AppState)=>{
  return bfsDir(state.file.root, path);
})


export const selectFile = (path:string)=>((state:AppState)=>{
  return bfsDir(state.file.root, path)?.files.filter(file=>Path.areSame(file.node.path, path)).at(0);
})

export const dirValue = (path: string) =>bfsDir(store.getState().file.root, path);
export const dirExists = (path: string) =>!!dirValue(path);


export const fileValue = (path: string) =>bfsDir(store.getState().file.root, new Path(path).parent).files.filter(file=>Path.areSame(file.node.path, path)).at(0);
export const fileExists = (path:string)=>!!fileValue(path)



////////////////////////

export default fileSlice.reducer;
export const { mkdir, addFile, rm, rmdir } = fileSlice.actions;