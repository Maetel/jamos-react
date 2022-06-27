import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import FinderIcon from "../components/FinderIcon";
import Window from "../components/Window";
import FileMgr from "../features/file/FileMgr";
import { Node } from "../features/file/FileTypes";
import Log from "../features/log/Log";
import ProcMgr from "../features/procmgr/ProcMgr";
import { ToolbarControl } from "../grounds/Toolbar";
import Path from "../scripts/Path";

import styles from "../styles/Finder.module.css";

export default function Finder(props) {
  const backBtn = useRef(null),
    forwardBtn = useRef(null);
  const proc = { ...props.proc };
  proc.name = proc.name ?? "Finder";

  const [currentPath, setCurrentPath] = useState(props.proc.path);
  const [pathList, setPathList] = useState([props.proc.path]);
  const onIconClick = (_node: Node) => {
    const nodeIsDir = () => _node.type === "dir";
    setCurrentPath((p) => {
      return nodeIsDir() ? _node.path : p;
    });
    setPathList((l) => {
      return nodeIsDir() ? [...l, _node.path] : l;
    });
    if (!nodeIsDir()) {
      procmgr.exeFile(new Path(_node.path));
    }
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
    ToolbarControl.RegisterBuilder(proc.id).register(
      "Finder",
      "New directory",
      () => {
        filemgr.mkdir(Path.join(currentPath, "New directory").path);
      }
    );
  }, [currentPath]);

  const procmgr = ProcMgr.getInstance();
  const filemgr = FileMgr.getInstance();

  const selector = useAppSelector;

  ////////////// browse back and forth
  const nodes = filemgr.nodesReadable(selector, currentPath);
  return nodes ? (
    <Window {...props} proc={proc}>
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
    </Window>
  ) : undefined;
}
