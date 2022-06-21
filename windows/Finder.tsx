import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import FinderIcon from "../components/FinderIcon";
import Window from "../components/Window";
import FileMgr from "../features/file/FileMgr";
import Log from "../features/log/Log";
import ProcMgr from "../features/procmgr/ProcMgr";

import styles from "../styles/Finder.module.css";

export default function Finder(props) {
  const backBtn = useRef(null),
    forwardBtn = useRef(null);
  const proc = { ...props.proc };
  proc.name = proc.name ?? "Finder";

  const [currentPath, setCurrentPath] = useState(props.proc.path);
  const [pathList, setPathList] = useState([props.proc.path]);
  const onIconClick = (node) => {
    setCurrentPath((p) => node.path);
    setPathList((l) => [...l, node.path]);
  };
  const browseBack = (e) => {
    setCurrentPath((p) => pathList.at(pathList.length - 2) ?? p);
    setPathList((l) => l.slice(0, -1));
  };

  useEffect(() => {
    (backBtn?.current as HTMLButtonElement).disabled = pathList.length <= 1;
  });

  const procmgr = ProcMgr.getInstance();
  const filemgr = FileMgr.getInstance();

  const dispatch = useAppDispatch();
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
