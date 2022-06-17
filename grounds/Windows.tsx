import React, { ReactElement, useEffect, useState } from "react";
import { Provider } from "react-redux";
import store from "../app/store";
import Log from "../features/log/Log";

import ProcMgr from "../features/procmgr/ProcMgr";
import styles from "../styles/Windows.module.css";
import TestWindow from "../windows/TestWindow";
import Logger from "../windows/Logger";
import { useAppDispatch } from "../app/hooks";
import { setProcProps } from "../features/procmgr/procSlice";
import { Rect } from "../features/procmgr/ProcTypes";

const winCmdMap: { [key: string]: (props) => JSX.Element } = {
  testwindow: TestWindow,
  logger: Logger,
};

export default function Windows(props) {
  const dispatch = useAppDispatch();
  const procmgr = ProcMgr.getInstance();
  const processes = procmgr.procsInOrder;
  const rect: Rect = {
    top: "5%",
    left: "5%",
    width: "90%",
    height: "90%",
  };

  return (
    <div className={styles.container}>
      <button
        className="add"
        onClick={() => {
          // setWindows([...windows, "testwindosw"])
          procmgr.add("testwindow");
        }}
      >
        testwindow
      </button>
      <button
        className="add"
        onClick={() => {
          // setWindows([...windows, "testwindosw"])
          procmgr.add("logger");
        }}
      >
        logger
      </button>
      <button
        className="add"
        onClick={() => {
          // setWindows([...windows, "testwindosw"])
          dispatch(setProcProps({ id: "1", props: { rect: rect } }));
        }}
      >
        setrect
      </button>
      {processes.map((proc) => (
        <Provider store={store} key={proc.id}>
          {React.createElement(winCmdMap[proc.comp], {
            proc: proc,
          })}
        </Provider>
      ))}
    </div>
  );
}
