import store from "../../app/store";
import Path from "../../scripts/Path";
import { addFile, dirExists, fileExists, mkdir } from "./fileSlice";
import type { File } from "./FileTypes";

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

  public mkdir(path:string){
    if (dirExists(path)) {
      // console.warn(`Directory '${path}' already exists`);
      return true;
    }
    store.dispatch(mkdir(path));
    return true;
  }

  public makeFile(path:string, type:string, iconPath?:string, exeCmd?:string, args?:any, data?:any){
    const f:File = {
      node:{
        id:type+path,
        path:path,
        type:type,
        exeCmd:exeCmd || type,
        iconPath:iconPath,
      },
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
}