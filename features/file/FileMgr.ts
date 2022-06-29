import store from "../../app/store";
import Path from "../../scripts/Path";
import { addFile, dirExists, dirValue, fileExists, fileValue, loadFilesFromString, mkdir, rm, rmdir, selectDir, selectFileData, selectNode, selectNodesInDir, setFileData } from "./fileSlice";
import { File, NodeControl } from "./FileTypes";
import {useAppSelector} from '../../app/hooks'
import type {Node} from './FileTypes'

export default class FileMgr {
  private static instance:FileMgr;
  private constructor (){

  }
  public static getInstance(){
    if(!this.instance){
      this.instance = new FileMgr();
    }
    return this.instance;
  }

  public fileExists(path:string){
    return fileExists(path);
  }

  public fileValue(path:string){
    return fileValue(path);
  }

  public dirValue(path:string){
    return dirValue(path);
  }
  public dirReadable(path:string){
    return useAppSelector(selectDir(path));
  }

  public nodeReadable(path:string):Node{
    return useAppSelector(selectNode(path));
  }

  public nodesReadable(dirPath:string):Node[]{
    if(!dirExists(dirPath)){
      return undefined;
    }
    return useAppSelector(selectNodesInDir(dirPath));
  }

  public dirExists(path:string){
    return dirExists(path);
  }

  public mkdir(path:string){
    if (dirExists(path)) {
      // console.warn(`Directory '${path}' already exists`);
      return true;
    }
    store.dispatch(mkdir(path));
    return true;
  }

  public rm(path:string){
    if(!this.fileExists(path)){
      return false;
    }
    store.dispatch(rm(path));
    return true;
  }

  public rmdir(path:string){
    if(!this.dirExists(path)){
      return false;
    }
    store.dispatch(rmdir(path));
    return true;
  }

  public makeFile(path:string, type:string, args?: {iconPath?:string, exeCmd?:string, data?:any}){
    
    const f:File = {
      node:NodeControl.build(path, type, args?.exeCmd, args?.iconPath, args?.data),
      data:args?.data
    }
    return f;
  }

  public addFiles(files: File[]){
    files.forEach(file=>this.addFile(file));
  }
  public addFile(file: File) {
    const path = file.node.path;
    
    if (fileExists(path)) {
      console.warn(`${path} exists`);
      return false;
    }

    const parentPath = new Path(file.node.path).parent;
    if (!this.mkdir(parentPath)) {
      console.error(`Failed mkdir towards ${parentPath}`);
      return false;
    }
    store.dispatch(addFile(file))
    return true;
  }
  public touch (path:string, data?) {
    if(fileExists(path)){
      return false;
    }
    const parentPath = new Path(path).parent;
    if (!this.mkdir(parentPath)) {
      console.error(`Failed mkdir towards ${parentPath}`);
      return false;
    }
    store.dispatch(addFile(this.makeFile(path, 'text')))
    return true;
  }

  public stringify ():string{
    return JSON.stringify(store.getState().file);
  }
  public async loadFromString(data:string) {
    try {
      const parsed = await JSON.parse(data);
      store.dispatch(loadFilesFromString(parsed));
      
    } catch (error) {
      console.error(error);
    }
  }

  public updateFileData(path:string, dataKey:string, dataValue:any){
    store.dispatch(setFileData({filePath:path, dataKey:dataKey, dataValue:dataValue}))
  }
  public fileDataReadable(path:string, dataKey?:string){
    return useAppSelector(selectFileData(path, dataKey));
  }

  public fileDataValue(path:string, dataKey?:string){
    return dataKey ? fileValue(path)?.data[dataKey] : fileValue(path)?.data
  }
}