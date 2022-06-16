export class Process {
  static empty(){
    return new Process(
      ProcCore.empty(),
      ProcData.empty(),
    )
  }
  isEmpty() {return this.core.isEmpty()};

  //public core:ProcCore;
  public data:ProcData;
 constructor(public core:ProcCore, data?:ProcData){
   this.data = data || new ProcData(core.id);
 }
}
export class ProcCore {
  static empty() {
    return new ProcCore('','');
  }
  isEmpty(){return this.id===''}
  // node?:Node;
  name:string = 'untitled process';

  status: 'new' | 'ready' | 'running' | 'sleep' | 'terminated' = 'new';
  public stringify():string {
    throw new Error("Not implemented");
  }
  
  constructor(public id:string, public comp:string, public onMount?:(string)=>void){}
}
export class ProcData {
  static empty(){return new ProcData('')}
  constructor(public id:string, public data:{}={}){}
  
  isEmpty(){return this.id===''}
}