import store from "../../app/store";
import { getSettingsValue, selectSettings, setSetting } from "./settingsSlice";
import officialThemes, { defaultTheme, Theme, themeByName } from "./Themes";


export default class SetMgr {
  private static instance:SetMgr;
  private constructor (){

  }
  public static getInstance(){
    if(!this.instance){
      this.instance = new SetMgr();
    }
    return this.instance;
  }

  public set(settingKey:string,settingValue:any){
    const pair = {};
    pair[settingKey] = settingValue;
    store.dispatch(setSetting(pair));
  }
  public setTheme(theme:string, caseSensitive =false){
    let _th = theme;
    if(caseSensitive){
      if(!officialThemes.some(th=>th.name===theme)){
        _th = defaultTheme.name;
      }
    } else {
      if(!officialThemes.some(th=>th.name.toLowerCase()===theme.toLowerCase())){
        _th = defaultTheme.name;
      }
    }
    
    this.set('theme', _th);
  }
  public setData(data:{}){
    store.dispatch(setSetting(data));
  }
  public getReadable(useAppSelector,key:string){
    return useAppSelector(selectSettings(key))
  }
  public getValue(key:string) {
    return getSettingsValue(key);
  }

  public defaultTheme() : Theme {
    return {...defaultTheme};
  }

  public themeValue():Theme {
    return themeByName(this.getValue('theme'))
  }

  public themeReadable(useAppSelector):Theme {
    return themeByName(this.getReadable(useAppSelector, 'theme'));
  }

  public color1(useAppSelector):string {
    return this.themeReadable(useAppSelector).colors['1']
  }
  public color2(useAppSelector):string {
    return this.themeReadable(useAppSelector).colors['2']
  }
  public color3(useAppSelector):string {
    return this.themeReadable(useAppSelector).colors['3']
  }
  public colorOkay(useAppSelector):string {
    return this.themeReadable(useAppSelector).colors.okay
  }
  public colorWarn(useAppSelector):string {
    return this.themeReadable(useAppSelector).colors.warn
  }
  public colorError(useAppSelector):string {
    return this.themeReadable(useAppSelector).colors.error
  }
  
}