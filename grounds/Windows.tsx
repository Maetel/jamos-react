import React, { ReactElement, useEffect, useState } from "react";

import ProcMgr from "../features/procmgr/ProcMgr";
import styles from "../styles/Windows.module.css";
import TestWindow from "../windows/TestWindow";

const winCmdMap: { [key: string]: (props) => JSX.Element } = {
  testwindow: TestWindow,
};

export default function Windows(props) {
  const procmgr = ProcMgr.getInstance();
  const processes = procmgr.procsInOrder;

  return (
    <div className={styles.container}>
      <button
        className="add"
        onClick={() => {
          // setWindows([...windows, "testwindosw"])
          procmgr.add("testwindow");
        }}
      >
        add test
      </button>
      {/* {windows
        .filter((winname) => {
          if (winCmdMap[winname] === undefined) {
            console.error("No such element : ", winname);
            return false;
          }

          return true;
        })
        .map((winname, i) =>
          React.createElement(winCmdMap[winname], { key: i })
        )} */}
      {processes.map((proc) =>
        React.createElement(winCmdMap[proc.comp], {
          key: proc.id,
          proc: proc,
        })
      )}
    </div>
  );
}
