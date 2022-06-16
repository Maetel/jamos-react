import React, { ReactElement, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  addProc,
  ProcCore,
  Process,
  selectProcesses,
} from "../features/procmgr/procSlice";
import styles from "../styles/Windows.module.css";
import TestWindow from "../windows/TestWindow";

const winCmdMap: { [key: string]: (props) => JSX.Element } = {
  testwindow: TestWindow,
};

export default function Windows(props) {
  const dispatch = useAppDispatch();
  const processes = useAppSelector(selectProcesses);

  let [windows, setWindows] = useState(["testwindow"]);
  return (
    <div className={styles.container}>
      <button
        className="add"
        onClick={() => {
          // setWindows([...windows, "testwindosw"])
          dispatch(addProc(new Process(new ProcCore("1", "testwindow"))));
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
        React.createElement(winCmdMap[proc.core.comp], { key: proc.core.id })
      )}
    </div>
  );
}
