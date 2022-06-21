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
    const f: File[] = [
      filemgr.makeFile("~/Terminal", "terminal", "/imgs/terminal.svg"),
      filemgr.makeFile("~/Logger", "logger", "/imgs/logger.svg"),
      filemgr.makeFile("~/System Info", "systeminfo", "/imgs/chart.svg"),
      filemgr.makeFile(
        "~/Portfolio/Clips/1. Intro",
        "browser",
        "/imgs/jamos.png",
        "browser https://www.youtube.com/embed/8CfT8yN5tgw"
      ),
      filemgr.makeFile(
        "~/Portfolio/Career description",
        "browser",
        "/imgs/career.svg",
        "browser https://v1.embednotion.com/embed/9091c7d511f941b387d3064690d4d2dd"
      ),
      filemgr.makeFile("~/Styler", "styler", "/imgs/styler.svg"),
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
