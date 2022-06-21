import React from "react";
import { useEffect } from "react";
import { useAppSelector } from "../app/hooks";
import FinderIcon from "../components/FinderIcon";
import FileMgr from "../features/file/FileMgr";
import { selectNodesInDir } from "../features/file/fileSlice";
import ProcMgr from "../features/procmgr/ProcMgr";
import SetMgr from "../features/settings/SetMgr";
import { randomId } from "../scripts/utils";
import { File } from "../features/file/FileTypes";

import styles from "../styles/Desktop.module.css";

let initted = false;
const backgroundImg = "/imgs/wall2.jpg";
const broomImg = "/imgs/broom.svg";

export default function Desktop(props) {
  const procmgr = ProcMgr.getInstance();
  const filemgr = FileMgr.getInstance();

  const init = () => {
    procmgr.add("terminal");
    const f: File[] = [
      filemgr.makeFile("~/Terminal", "terminal", "/imgs/terminal.svg"),
      filemgr.makeFile("~/Logger", "logger", "/imgs/logger.svg"),
      filemgr.makeFile("~/System Info", "systeminfo", "/imgs/chart.svg"),
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
  };

  useEffect(() => {
    if (!initted) {
      init();
      initted = true;
    }
  }, []);

  const homeNodes = useAppSelector(selectNodesInDir("~/"));
  const theme = SetMgr.getInstance().themeReadable(useAppSelector);
  const _colors = theme.colors;

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
