import { useSelector } from "react-redux";
import { useAppSelector } from "../../app/hooks";
import store from "../../app/store";
import { getSettingsValue, loadSettingsFromString, selectSettings, selectThemeColors, setSetting } from "./settingsSlice";
import officialThemes, { defaultTheme, Theme, themeByName, ThemeColors } from "./Themes";


export default class SetMgr {
  private static instance:SetMgr;
  private constructor (){

  }
  public static colors():ThemeColors {
    this.getInstance();
    return useSelector(selectThemeColors);
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
  public getReadable(key:string){
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

  public themeReadable():Theme {
    return themeByName(useAppSelector(selectSettings('theme')));
  }

  public color1():string {
    return this.themeReadable().colors['1']
  }
  public color2():string {
    return this.themeReadable().colors['2']
  }
  public color3():string {
    return this.themeReadable().colors['3']
  }
  public colorOkay():string {
    return this.themeReadable().colors.okay
  }
  public colorWarn():string {
    return this.themeReadable().colors.warn
  }
  public colorError():string {
    return this.themeReadable().colors.error
  }
  public stringify ():string{
    return JSON.stringify(store.getState().settings);
  }
  public async loadFromString(data:string) {
    try {
      const parsed = await JSON.parse(data);
      store.dispatch(loadSettingsFromString(parsed));
      
    } catch (error) {
      console.error(error);
    }
  }
}