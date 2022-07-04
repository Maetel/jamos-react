import JamOS from "../features/JamOS/JamOS";
import { File } from "../features/file/FileTypes";
import { useEffect, useState } from "react";
import Window from "../components/Window";

let initted = false;
let loadOnce = false;

export class BootMgr {
  public static reinit() {}
}

export default function BootLoader(props) {
  const proc = { ...props.proc };
  proc.name = "BootLoader";
  proc.rect = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    minWidth: 0,
    minHeight: 0,
  };

  const procmgr = JamOS.procmgr;
  const filemgr = JamOS.filemgr;
  const setmgr = JamOS.setmgr;
  const saveOnExit = setmgr.getReadable("saveOnExit");
  const askOnExit = setmgr.getReadable("askOnExit");
  const muteOptions = setmgr.getReadable("muteAllOptions");
  const reinit = BootMgr.reinit();

  const init = () => {
    procmgr.add("terminal");
    // procmgr.add("testwindow");
    filemgr.mkdir("~/deep/deeeeeep/directory");
    const f: File[] = [
      filemgr.makeFile("~/AppStore", "appstore"),
      // filemgr.makeFile("~/Logger", "logger"),
      // filemgr.makeFile("~/Terminal", "terminal"),
      // filemgr.makeFile("~/System Info", "systeminfo"),
      // filemgr.makeFile("~/Settings", "settings"),
      // filemgr.makeFile("~/Postman", "postman"),
      // filemgr.makeFile("~/Atelier", "atelier"),
      // filemgr.makeFile("~/Tester", "testwindow"),
      // filemgr.makeFile("~/Styler", "styler"),

      filemgr.makeFile("~/Sample text1.txt", "text", {
        data: { text: "This is a sample text1." },
      }),
      // filemgr.makeFile("~/Text2.txt", "text", {
      //   data: { text: "This is a sample text2." },
      // }),
      filemgr.makeFile("~/Portfolio/Clips/1. Intro", "browser", {
        iconPath: "/imgs/jamos.png",
        exeCmd: "browser https://www.youtube.com/embed/8CfT8yN5tgw",
      }),
      filemgr.makeFile("~/Portfolio/Career description", "browser", {
        iconPath: "/imgs/career.svg",
        exeCmd:
          "browser https://v1.embednotion.com/embed/9091c7d511f941b387d3064690d4d2dd",
      }),
    ];
    filemgr.addFiles(f);
    procmgr.openToolbar();
    procmgr.openDock();
    JamOS.setNotif("Welcome to JamOS", "system");
    setTimeout(() => {
      procmgr.closeToolbar();
      procmgr.closeDock();
    }, 1500);
  };

  useEffect(() => {}, []);

  useEffect(() => {
    if (muteOptions) {
      if (!initted) {
        init();
        initted = true;
      }
      return;
    }
    const d = JamOS.loadData("breadData");
    if (d && !true) {
      JamOS.loadFromString(d);
      JamOS.setNotif("Loading finished!");
    } else {
      if (!initted) {
        init();
        initted = true;
      }
    }
  }, []);

  const [beforeUnloadFunc, setBefore] = useState(null);
  useEffect(() => {
    if (muteOptions) {
      return;
    }

    console.log(
      `Update option. saveOnExit:${saveOnExit}, askOnExit:${askOnExit}`
    );
    const onSaveOnExit = (e) => {
      JamOS.saveData("breadData", JamOS.stringify());
      console.log("Save on exit");
    };
    const onAskOnExit = (e) => {
      e.preventDefault();
      e.returnValue = "";
      console.log("Ask on exit");
    };
    let f;
    if (saveOnExit && !askOnExit) {
      f = (e) => {
        onSaveOnExit(e);
      };
    }
    if (!saveOnExit && askOnExit) {
      f = (e) => {
        onAskOnExit(e);
      };
    }
    if (saveOnExit && askOnExit) {
      f = (e) => {
        onSaveOnExit(e);
        onAskOnExit(e);
      };
    }
    if (!saveOnExit && !askOnExit) {
      f = (e) => {};
    }
    if (beforeUnloadFunc) {
      console.log("Option changed. beforeUnloadFunc:", beforeUnloadFunc);
      window.removeEventListener("beforeunload", beforeUnloadFunc);
    } else {
    }
    {
      console.log("Set before :", f);
      setBefore(() => f);
    }
    // beforeUnloadFunc = f;
    window.addEventListener("beforeunload", f);
  }, [saveOnExit, askOnExit, muteOptions]);

  return <Window {...props} proc={proc}></Window>;
}
