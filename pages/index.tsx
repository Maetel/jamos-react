import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import Meta from "../grounds/Meta";
import Desktop from "../grounds/Desktop";
import Windows from "../grounds/Windows";
import Toolbar from "../grounds/Toolbar";
import Dock from "../grounds/Dock";
import Notification from "../grounds/Notification";
import { useEffect } from "react";
import JamOS from "../features/JamOS/JamOS";

const Home: NextPage = () => {
  useEffect(() => {
    JamOS.procmgr.add("bootloader");
  }, []);

  return (
    <div className={styles.container}>
      <Meta></Meta>
      <main className={styles.main}>
        <Toolbar></Toolbar>
        <Dock></Dock>
        <Desktop></Desktop>
        <Windows></Windows>
        <Notification></Notification>
      </main>
    </div>
  );
};

export default Home;
