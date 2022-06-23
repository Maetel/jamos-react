export interface CollapsibleMenu {
  caller: string; // 'system' || procId
  menu: string;
  items: CollapsibleItem[];
}
export interface CollapsibleItem {
  item: string;
  callback?:string; //for system
  disabled?: boolean;
  separator?: boolean;
  //osCallback?:()=>void; // will be registered for default(left) menu, and will be excluded on serialization
}