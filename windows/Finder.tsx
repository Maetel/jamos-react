import React from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import FinderIcon from "../components/FinderIcon";
import Window from "../components/Window";
import FileMgr from "../features/file/FileMgr";
import Log from "../features/log/Log";
import ProcMgr from "../features/procmgr/ProcMgr";

import styles from "../styles/Finder.module.css";

export default function Finder(props) {
  const proc = props.proc;
  const currentPath: string = props.proc.path;

  const procmgr = ProcMgr.getInstance();
  const filemgr = FileMgr.getInstance();

  const dispatch = useAppDispatch();
  const selector = useAppSelector;

  ////////////// browse back and forth
  const nodes = filemgr.nodesReadable(selector, currentPath);
  return nodes ? (
    <Window {...props}>
      <div className={styles.container}>
        <div className={styles.browser}>
          <button className={`${styles.browserContent} ${styles.button}`}>
            &larr;
          </button>
          <button className={`${styles.browserContent} ${styles.button}`}>
            &rarr;
          </button>
          <span className={`${styles.browserContent} ${styles.path}`}>
            {currentPath}
          </span>
        </div>
        <div className={styles.iconContainer}>
          {nodes.map((node, i) => {
            return React.createElement(FinderIcon, { node: node, key: i });
          })}
        </div>
      </div>
    </Window>
  ) : undefined;
}
