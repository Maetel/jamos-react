import store from "../../app/store";
import Commands from "../../scripts/CommandParser";
import Path from "../../scripts/Path";
import { addFile, dirExists, dirValue, fileExists, fileValue, mkdir, rm, rmdir, selectDir, selectNodesInDir } from "./fileSlice";
import { File, NodeControl } from "./FileTypes";

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
  public dirReadable(useAppSelector, path:string){
    return useAppSelector(selectDir(path));
  }

  public nodesReadable(useAppSelector, path:string):Node[]{
    if(!dirExists(path)){
      return undefined;
    }
    return useAppSelector(selectNodesInDir(path));
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

  public makeFile(path:string, type:string, iconPath?:string, exeCmd?:string, data?:any){
    
    const f:File = {
      node:NodeControl.build(path, type, exeCmd, iconPath, data),
      data:data
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
    store.dispatch(addFile(this.makeFile(path, 'text')))
    return true;
  }
}