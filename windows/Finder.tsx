import React, { useEffect, useRef, useState } from "react";
import FinderIcon from "../components/FinderIcon";
import Window from "../components/Window";
import { Node } from "../features/file/FileTypes";
import CallbackStore from "../features/JamOS/Callbacks";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import { ToolbarControl } from "../grounds/Toolbar";
import Path from "../scripts/Path";

import styles from "../styles/Finder.module.css";

export function FinderCore(props) {
  const proc: Process = props.proc;
  const callbackId = proc.callbackId;
  const blockExeFile = proc.blockExeFile;
  const backBtn = useRef(null),
    forwardBtn = useRef(null);
  const [currentPath, setCurrentPath] = useState(proc.path);
  const [pathList, setPathList] = useState([proc.path]);
  const onIconClick = (_node: Node) => {
    const nodeIsDir = () => _node.type === "dir";
    setCurrentPath((p) => {
      return nodeIsDir() ? _node.path : p;
    });
    setPathList((l) => {
      return nodeIsDir() ? [...l, _node.path] : l;
    });
    if (!nodeIsDir() && !blockExeFile) {
      procmgr.exeFile(new Path(_node.path));
    }
    console.log("callbackId:", callbackId);
    CallbackStore.getById(callbackId)?.(_node);
  };
  const browseBack = (e) => {
    setCurrentPath((p) => pathList.at(pathList.length - 2) ?? p);
    setPathList((l) => l.slice(0, -1));
  };

  useEffect(() => {
    if (backBtn?.current) {
      (backBtn.current as HTMLButtonElement).disabled = pathList.length <= 1;
    }
  });

  useEffect(() => {
    ToolbarControl.RegisterBuilder(proc.id)
      .unregisterAll()
      .register("Finder", "New directory", () => {
        filemgr.mkdir(Path.join(currentPath, "New directory").path);
      });
  }, [currentPath]);

  const procmgr = JamOS.procmgr;
  const filemgr = JamOS.filemgr;

  ////////////// browse back and forth
  const nodes = filemgr.nodesReadable(currentPath);
  return nodes ? (
    <div className={styles.container}>
      <div className={styles.browser}>
        <button
          className={`${styles.browserContent} ${styles.button}`}
          ref={backBtn}
          onClick={browseBack}
        >
          &larr;
        </button>
        {/* <button
            className={`${styles.browserContent} ${styles.button}`}
            ref={forwardBtn}
            onClick={browseForward}
          >
            &rarr;
          </button> */}
        <span className={`${styles.browserContent} ${styles.path}`}>
          {currentPath}
        </span>
      </div>
      <div className={styles.iconContainer}>
        {nodes.map((node, i) => {
          return React.createElement(FinderIcon, {
            node: node,
            key: i,
            onClick: onIconClick,
          });
        })}
      </div>
    </div>
  ) : undefined;
}

export default function Finder(props) {
  const proc = { ...props.proc };
  proc.name = proc.name ?? "Finder";
  proc.resize = proc.resize ?? "both";

  return (
    <Window {...props} proc={proc}>
      <FinderCore proc={proc}></FinderCore>
    </Window>
  );
}
