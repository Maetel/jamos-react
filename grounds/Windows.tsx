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
import Atelier from "../windows/Atelier";
import SimpleAbout from "../windows/SimpleAbout";
import Modal from "../components/Modal";
import System from "./System";
import Viewer from "../windows/Viewer";
import FileDialogue from "../components/FileDialogue";
import ContextMenu from "../components/ContextMenu";
import TextModal from "../components/TextModal";
import Comments from "../windows/Comments";

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
  atelier: Atelier,
  simpleabout: SimpleAbout,
  modal: Modal,
  system: System,
  viewer: Viewer,
  filedialogue: FileDialogue,
  contextmenu: ContextMenu,
  textmodal: TextModal,
  comments: Comments,
};

export default function Windows(props) {
  const procmgr = JamOS.procmgr;
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
