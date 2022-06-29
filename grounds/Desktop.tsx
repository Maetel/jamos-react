import React from "react";
import { useEffect } from "react";
import FinderIcon from "../components/FinderIcon";
import { File } from "../features/file/FileTypes";

import styles from "../styles/Desktop.module.css";
import JamOS from "../features/JamOS/JamOS";

let initted = false;
const backgroundImg = "/imgs/wall2.jpg";
const broomImg = "/imgs/broom.svg";

export default function Desktop(props) {
  const procmgr = JamOS.procmgr();
  const filemgr = JamOS.filemgr();
  const setmgr = JamOS.setmgr();
  const saveOnExit = setmgr.getReadable("saveOnExit");
  const askOnExit = setmgr.getReadable("askOnExit");
  const muteOptions = setmgr.getReadable("muteAllOptions");

  const init = () => {
    procmgr.add("terminal");
    // procmgr.add("testwindow");
    filemgr.mkdir("~/1/2/3");
    const f: File[] = [
      filemgr.makeFile("~/Terminal", "terminal", "/imgs/terminal.svg"),
      // filemgr.makeFile("~/Logger", "logger", "/imgs/logger.svg"),
      filemgr.makeFile("~/System Info", "systeminfo", "/imgs/chart.svg"),
      filemgr.makeFile("~/Settings", "settings", "/imgs/settings.svg"),
      filemgr.makeFile("~/Postman", "postman", "/imgs/postman.svg"),
      filemgr.makeFile("~/Tester", "testwindow"),
      filemgr.makeFile(
        "~/Portfolio/Clips/1. Intro",
        "browser",
        "/imgs/jamos.png",
        "browser https://www.youtube.com/embed/8CfT8yN5tgw"
      ),
      filemgr.makeFile(
        "~/Portfolio/Career description",
        "browser",
        "/imgs/career.svg",
        "browser https://v1.embednotion.com/embed/9091c7d511f941b387d3064690d4d2dd"
      ),
      filemgr.makeFile("~/Styler", "styler", "/imgs/styler.svg"),
    ];
    filemgr.addFiles(f);
    procmgr.openToolbar();
    procmgr.openDock();
    setTimeout(() => {
      procmgr.closeToolbar();
      procmgr.closeDock();
    }, 1500);
  };

  useEffect(() => {
    if (muteOptions) {
      if (!initted) {
        init();
        initted = true;
      }
      return;
    }
    const d = JamOS.loadData("breadData");
    if (d && true) {
      JamOS.loadFromString(d);
    } else {
      if (!initted) {
        init();
        initted = true;
      }
    }
  }, []);

  let beforeUnloadFunc;
  useEffect(() => {
    if (muteOptions) {
      return;
    }

    console.log(
      `Update option. saveOnExit:${saveOnExit}, askOnExit:${askOnExit}`
    );
    const f = (e) => {
      if (saveOnExit) {
        JamOS.saveData("breadData", JamOS.stringify());
        console.log("Save on exit");
        debugger;
      }
      if (askOnExit) {
        e.preventDefault();
        e.returnValue = "";
        console.log("Ask on exit");
      }
    };
    if (beforeUnloadFunc) {
      window.removeEventListener("beforeunload", beforeUnloadFunc);
    } else {
    }
    beforeUnloadFunc = f;
    window.addEventListener("beforeunload", f);
  }, [saveOnExit, askOnExit, muteOptions]);

  const homeNodes = JamOS.filemgr().nodesReadable("~");

  const _colors = JamOS.theme().colors;

  return (
    <div id="desktop" className={styles.container}>
      <img
        id="broom-image"
        className={styles.broomImage}
        src={broomImg}
        alt="Broom effect"
      />
      <div className={styles.bgImageWrapper}>
        <img
          className={styles.bgImage}
          src={backgroundImg}
          alt="Desktop background"
        />
        <div
          className={styles.behindImage}
          style={{ backgroundColor: _colors["1"] }}
        />
      </div>
      <div className={styles.iconContainer}>
        {/* {#each $nodes as node (node.node.id)}
      <FinderIcon fileNode={node.node} />
    {/each} */}
        {homeNodes.map((node, i) => {
          return React.createElement(FinderIcon, { node: node, key: i });
        })}
      </div>
    </div>
  );
}
