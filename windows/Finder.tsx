import React, { useEffect, useRef, useState } from "react";
import { FileDialProps } from "../components/FileDialogue";
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
  const backBtn = useRef(null);

  useEffect(() => {
    JamOS.procmgr.set(proc.id, { currentPath: proc.path });
  }, []);
  const currentPath = JamOS.procmgr.getReadable(proc.id, "currentPath");
  const setCurrentPath = (path) => {
    JamOS.procmgr.set(proc.id, { currentPath: path });
  };
  const [pathList, setPathList] = useState([proc.path]);
  const fileDialProps: FileDialProps = proc.fileDialProps;
  const incls = fileDialProps?.includes;
  const excls = fileDialProps?.excludes;
  const onIconClick = (_node: Node) => {
    const nodeIsDir = () => _node.type === "dir";
    setCurrentPath(nodeIsDir() ? _node.path : currentPath);
    setPathList((l) => {
      return nodeIsDir() ? [...l, _node.path] : l;
    });
    if (!nodeIsDir() && !blockExeFile) {
      procmgr.exeFile(new Path(_node.path));
    }
    CallbackStore.getById(callbackId)?.(_node);
  };
  const browseBack = (e) => {
    setCurrentPath(pathList.at(pathList.length - 2) ?? currentPath);
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
          if (excls?.includes(node.type)) {
            return;
          }

          if (!incls || incls?.includes(node.type) || node.type === "dir") {
            return React.createElement(FinderIcon, {
              node: node,
              key: i,
              onClick: onIconClick,
            });
          }
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
