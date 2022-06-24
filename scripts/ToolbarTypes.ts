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

export function ToolbarItemsAreSame(lhs:ToolbarItem, rhs:ToolbarItem){
  return ToolbarItemId(lhs)===ToolbarItemId(rhs);
}

export function ToolbarItemId(item:ToolbarItem){
  return `${item.caller}//${item.menu}//${item.item}`;
}
export interface ToolbarItem {
  caller: string; // 'system' || procId
  menu: string;
  item: string;
  callback?:string; //for system
  order?:number;
  disabled?: boolean;
  separator?: boolean;
}

export function serializeToolbarItem(item:ToolbarItem):string{
  return JSON.stringify(item);
}

export function parseToolbarItem(item:string):ToolbarItem{
  try {
    const parsed= JSON.parse(item);
    return parsed;
  } catch (error) {
    console.error(error);
  }
  return undefined;
}