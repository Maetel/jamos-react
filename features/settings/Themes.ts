export interface ThemeColors {
  '1':string,
    '2':string,
    '3':string,
    'okay':string,
    'warn':string,
    'error':string,
    'boxShadow':string,
    [key: string]: string
}
export interface Theme {
  name: string;
  colors:ThemeColors;
  nav: string; //define 'string : component' map at Window.svelte
}

///Theme list
export const defaultTheme: Theme = {
  name: "Forest",
  colors: {
    "1": "#cbccbc",
    "2": "#3e4437",
    "3": "#d4c9c1",
    "4": "#404c24",
    "5": "#a2ac94",
    okay: "#186030",
    warn: "#f07800",
    error: "#d80000",
    // navback: "#dbdbdb",
    // navcolor: "#595FB5",
    boxShadow: "2px 2px 26px #a2ac94",
  },
  nav: "default",
};

export const themeList = ()=>{
  return officialThemes.map(th=>th.name);
}
export const themeExists = (theme:string, caseSensitive=false)=>{
  return caseSensitive ? themeList().includes(theme) : themeList().map(name=>name.toLowerCase()).includes(theme);
}

// returns default if not found
export const themeByName = (name:string, caseSensitive = false)=>{
  return officialThemes.find(th=>{
    if(caseSensitive){
      return th.name===name;
    }
    return th.name.toLowerCase() === name.toLocaleLowerCase();
  }) ?? defaultTheme;
}
const officialThemes:Theme[] = [
    { ...defaultTheme },

    {
      //https://www.schemecolor.com/funky-music.php
      name: "NERDY",
      colors: {
        "1": "#FFD154",
        "2": "#595FB5",
        "3": "#EE475E",
        "4": "#4DBD60",
        "5": "#5E1D6E",
        okay: "#4DBD60",
        warn: "#FFD154",
        error: "#EE475E",
        // navback: "#dbdbdb",
        // navcolor: "#595FB5",
        boxShadow: "2px 2px 26px #5E1D6E",
      },
      nav: "default",
    },
    {
      //https://www.schemecolor.com/funky-music.php
      name: "Lo-fi",
      colors: {
        "1": "#CEA2D7",
        "2": "#674AB3",
        "3": "#A348A6",
        "4": "#9F63C4",
        "5": "#9075D8",
        okay: "#4DBD60",
        warn: "#FFD154",
        error: "#EE475E",
        // navback: "#dbdbdb",
        // navcolor: "#595FB5",
        boxShadow: "2px 2px 26px #9F63C4",
      },
      nav: "default",
    },

    {
      name: "Granite",
      colors: {
        "1": "#333",
        "2": "#fcf4f0",
        "3": "#484644",
        okay: "#00ca4e",
        warn: "#ffbd44",
        error: "#ff605c",
        point1: "",
        point2: "",
        boxShadow: "2px 2px 26px #3337",
      },
      nav: "default",
    },
    {
      //https://digitalsynopsis.com/design/minimal-web-color-palettes-combination-hex-code/
      name: "Oil paint",
      colors: {
        "1": "#F8B195",
        "2": "#355C7D",
        "3": "#F67280",
        "4": "#6C5B7B",
        "5": "#C06C84",
        okay: "#99B898",
        warn: "#FECEAB",
        error: "#E84A5F",
        // navback: "#dbdbdb",
        // navcolor: "#595FB5",
        boxShadow: "2px 2px 26px #F8B195",
      },
      nav: "default",
    },
    {
      //https://digitalsynopsis.com/design/minimal-web-color-palettes-combination-hex-code/
      name: "Peach Jelly",
      colors: {
        "1": "#DCEDC2",
        "2": "#FF8C94",
        "3": "#A8E6CE",
        "4": "#FFAAA6",
        "5": "#FFD3B5",
        okay: "#99B898",
        warn: "#FECEAB",
        error: "#E84A5F",
        // navback: "#dbdbdb",
        // navcolor: "#595FB5",
        boxShadow: "2px 2px 16px #A8E6CE",
      },
      nav: "default",
    },
    {
      //https://digitalsynopsis.com/design/minimal-web-color-palettes-combination-hex-code/
      name: "Rich soil",
      colors: {
        "1": "#E5FCC2",
        "2": "#594F4F",
        "3": "#9DE0AD",
        "4": "#547980",
        "5": "#45ADA8",
        okay: "#83AF9B",
        warn: "#F9CDAD",
        error: "#FE4365",
        // navback: "#dbdbdb",
        // navcolor: "#595FB5",
        boxShadow: "2px 2px 13px #E5FCC2",
      },
      nav: "default",
    },
    {
      //https://digitalsynopsis.com/design/minimal-web-color-palettes-combination-hex-code/
      name: "Espresso",
      colors: {
        "1": "#bcb0a1",
        "2": "#482317",
        "3": "#985836",
        okay: "#82ac26",
        warn: "#ffa22a",
        error: "#ff662a",
        // navback: "#dbdbdb",
        // navcolor: "#595FB5",
        boxShadow: "2px 2px 13px #bcb0a1",
      },
      nav: "default",
    },
    {
      //https://digitalsynopsis.com/design/minimal-web-color-palettes-combination-hex-code/
      name: "Plum",
      colors: {
        "1": "#f2eae3",
        "2": "#ff5978",
        "3": "#ffc876",
        "4": "#dc5990",
        okay: "#82ac26",
        warn: "#ffa22a",
        error: "#ff662a",
        // navback: "#dbdbdb",
        // navcolor: "#595FB5",
        boxShadow: "2px 2px 13px #f2eae3",
      },
      nav: "default",
    },
    {
      //https://digitalsynopsis.com/design/minimal-web-color-palettes-combination-hex-code/
      name: "Cloudy",
      colors: {
        "1": "#7896fc",
        "2": "#fcf4ec",
        "3": "#ffcfcb",
        "4": "#ff9f97",
        okay: "#82ac26",
        warn: "#ffa22a",
        error: "#ff662a",
        // navback: "#dbdbdb",
        // navcolor: "#595FB5",
        boxShadow: "2px 2px 10px #7896fc",
      },
      nav: "default",
    },
    {
      //https://digitalsynopsis.com/design/minimal-web-color-palettes-combination-hex-code/
      name: "Binary",
      colors: {
        // "1": "#111",
        // "2": "#fcf4f0",
        // "3": "#333",
        "1": "#000000",
        "2": "#ffffff",
        "3": "#777777",
        okay: "#00ff00",
        warn: "#ffff00",
        error: "#ff0000",
        // navback: "#dbdbdb",
        // navcolor: "#595FB5",
        boxShadow: "2px 2px 13px #111",
      },
      nav: "default",
    },
    {
      //https://digitalsynopsis.com/design/minimal-web-color-palettes-combination-hex-code/
      name: "Cotton candy",
      colors: {
        // "1": "#111",
        // "2": "#fcf4f0",
        // "3": "#333",
        "1": "#d5e4fb",
        "3": "#5c58b6",
        "2": "#5994ce",
        "4": "#b957ce",
        okay: "#00ff00",
        warn: "#ffff00",
        error: "#ff0000",
        // navback: "#dbdbdb",
        // navcolor: "#595FB5",
        boxShadow: "2px 2px 13px #111",
      },
      nav: "default",
    },
  ]
;

export default officialThemes;