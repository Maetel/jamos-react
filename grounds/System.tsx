import JamOS from "../features/JamOS/JamOS";
import { File } from "../features/file/FileTypes";
import { useEffect, useState } from "react";
import Process from "../features/procmgr/ProcTypes";
import Daemon from "../components/Daemon";
import { randomId } from "../scripts/utils";
import { JamUser, JamWorld, _initialWorld } from "../features/JamOS/osSlice";
import CallbackStore from "../features/JamOS/CallbackStore";

let initted = false;
let loadOnce = false;

export default function System(props) {
  const proc: Process = { ...props.proc };

  const procmgr = JamOS.procmgr;
  const filemgr = JamOS.filemgr;
  const setmgr = JamOS.setmgr;
  const saveOnExit = setmgr.getReadable("saveOnExit");
  const askOnExit = setmgr.getReadable("askOnExit");
  const muteOptions = setmgr.getReadable("muteAllOptions");
  const front = procmgr.front();

  const onSampleInit = () => {
    // procmgr.add("jamhub", { isInitial: true });
    procmgr.add("welcome", { isInitial: true });
    if (!1) {
      JamOS.forceOpenToolbar();
      JamOS.forceOpenDock();
      setTimeout(() => {
        JamOS.forceOpenToolbar(false);
        JamOS.forceOpenDock(false);
      }, 1500);
    } else {
      JamOS.openToolbar();
      JamOS.openDock();
    }
    // return;

    // procmgr.add("worldeditor");
    // procmgr.add("testwindow");
    filemgr.mkdir("~/deep/deeeeeep/directory");

    const f: File[] = [
      filemgr.makeFile("~/AppStore", "appstore"),
      filemgr.makeFile("~/Viewer", "viewer"),
      filemgr.makeFile("~/JamHub", "jamhub"),
      // filemgr.makeFile("~/Logger", "logger"),
      // filemgr.makeFile("~/Terminal", "terminal"),
      // filemgr.makeFile("~/System Info", "systeminfo"),
      // filemgr.makeFile("~/Settings", "settings"),
      // filemgr.makeFile("~/Postman", "postman"),
      // filemgr.makeFile("~/Atelier", "atelier"),
      // filemgr.makeFile("~/Tester", "testwindow"),
      // filemgr.makeFile("~/Styler", "styler"),

      filemgr.makeFile("~/Profile.jpg", "image", {
        data: { src: "/imgs/profile.jpg" },
      }),

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

    {
      //add random images
      const imageCount = 50;
      for (let i = 0; i < imageCount; ++i) {
        f.push(
          filemgr.makeFile(`~/Images/random image${i + 1}.jpg`, "image", {
            data: { src: `https://picsum.photos/seed/${randomId()}/500` },
          })
        );
      }
    }

    filemgr.addFiles(f);

    JamOS.setNotif("Welcome to JamOS", "system");
    JamOS.set({ sampleInit: undefined });
  };

  const init = () => {
    if (!1) {
      //test purpose
      procmgr.add("features");
      return;
    }

    // procmgr.add("terminal");
    JamOS.procmgr.killAll("system");
    JamOS.format();
    // JamOS.procmgr.add("jamhub", { isInitial: true });
    JamOS.procmgr.add("welcome", { isInitial: true });
    JamOS.openToolbar();
    // JamOS.setNotif("Press ESC to continue as a guest", "system");
    return;
  };

  useEffect(() => {
    if (proc.silently) {
      return;
    }
    if (muteOptions) {
      if (!initted) {
        init();
        initted = true;
      }
      return;
    }
    const initAnywaysForDebug = !true;
    {
      if (!initted) {
        init();
        initted = true;
      }
    }
  }, []);

  const [beforeUnloadFunc, setBefore] = useState(null);
  useEffect(() => {
    //TODO : this smells
    if (muteOptions) {
      return;
    }

    const onSaveOnExit = (e) => {
      JamOS.saveWorld();
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
      // console.log("Option changed. beforeUnloadFunc:", beforeUnloadFunc);
      window.removeEventListener("beforeunload", beforeUnloadFunc);
    } else {
    }
    {
      // console.log("Set before :", f);
      setBefore(() => f);
    }
    // beforeUnloadFunc = f;
    window.addEventListener("beforeunload", f);

    if (0) {
      console.log("Save on option change");
      JamOS.saveWorld();
    }
  }, [saveOnExit, askOnExit, muteOptions]);

  useEffect(() => {
    if (!front) {
      return;
    }
    if (front.isMaximized) {
      JamOS.forceHideToolbar();
      JamOS.forceHideDock();
    } else {
      JamOS.forceHideToolbar(false);
      JamOS.forceHideDock(false);
    }
  }, [front]);

  const world: JamWorld = JamOS.worldReadable();
  const jamUser: JamUser = JamOS.userReadable();
  useEffect(() => {
    if (!world.loaded && world.name !== "__pending__") {
      // console.log("Loading world : ", world.name);
      const _load = async () => {
        await JamOS.loadWorld(world.name);
        const cbid = JamOS.getValue("onWorldLoad");
        console.log("cbid:", cbid);
        CallbackStore.getById(cbid)?.();
      };
      _load();
    } else {
      // console.log(
      //   "NO world. world.loaded:",
      //   world.loaded,
      //   ", world.name:",
      //   world.name
      // );
      if (!proc.silently) {
        init();
      }
    }
  }, [jamUser, world]);

  const sampleInit = JamOS.getReadable("sampleInit");
  useEffect(() => {
    if (sampleInit === undefined) {
      return;
    }
    onSampleInit();
  }, [sampleInit]);

  const disableMetaKey = JamOS.getReadable("disableMetaKey");
  useEffect(() => {
    if (disableMetaKey) {
      setTimeout(() => {
        JamOS.set({ disableMetaKey: false });
      }, 250);
    }
  }, [disableMetaKey]);

  return <Daemon {...props} proc={proc}></Daemon>;
}
