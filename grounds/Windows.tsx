import React from "react";
import { Provider } from "react-redux";
import store from "../app/store";

import styles from "../styles/Windows.module.css";
import TestWindow from "../windows/TestWindow";
import Logger from "../windows/Logger";
import Terminal from "../windows/Terminal";
import Finder from "../windows/Finder";
import Notepad from "../windows/Notepad";
import Browser from "../windows/Browser";
import Styler from "../windows/Styler";
import SystemInfo from "../windows/SystemInfo";
import About from "../windows/About";
import Settings from "../windows/Settings";
import AppStore from "../windows/AppStore";
import JamOS from "../features/JamOS/JamOS";
import Postman from "../windows/Postman";

const winCmdMap: { [key: string]: (props) => JSX.Element } = {
  testwindow: TestWindow,
  logger: Logger,
  terminal: Terminal,
  finder: Finder,
  notepad: Notepad,
  browser: Browser,
  styler: Styler,
  systeminfo: SystemInfo,
  about: About,
  settings: Settings,
  appstore: AppStore,
  postman: Postman,
};

export default function Windows(props) {
  const procmgr = JamOS.procmgr();
  const processes = procmgr.procsInOrder;

  return (
    <div className={styles.container}>
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
