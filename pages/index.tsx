import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import Meta from "../grounds/Meta";
import Desktop from "../grounds/Desktop";
import Windows from "../grounds/Windows";
import { useEffect } from "react";
import ProcMgr from "../features/procmgr/ProcMgr";
import FileMgr from "../features/file/FileMgr";
import type { File } from "../features/file/FileTypes";

let added = false;
const Home: NextPage = () => {
  const procmgr = ProcMgr.getInstance();
  const filemgr = FileMgr.getInstance();

  const init = () => {
    procmgr.add("terminal");
    const f = [
      filemgr.makeFile("~/Terminal", "terminal", "/imgs/terminal.svg"),
      filemgr.makeFile("~/Logger", "logger", "/imgs/logger.svg"),
    ];
    filemgr.addFiles(f);
  };

  useEffect(() => {
    if (!added) {
      init();
      added = true;
    }
  }, []);

  return (
    <div className={styles.container}>
      <Meta></Meta>
      <main className={styles.main}>
        <Desktop></Desktop>
        <Windows></Windows>
      </main>
    </div>
  );
};

export default Home;
