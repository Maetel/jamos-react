import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import Meta from "../grounds/Meta";
import Desktop from "../grounds/Desktop";
import Windows from "../grounds/Windows";
import Toolbar from "../grounds/Toolbar";
import Dock from "../grounds/Dock";
import { useState } from "react";

const toolbarTriggerHeight = 3;
const dockTriggerHeight = 20;

const Home: NextPage = () => {
  const [showTb, setShowTb] = useState(false);
  const [showDock, setShowDock] = useState(false);
  return (
    <div className={styles.container}>
      <Meta></Meta>
      <main
        className={styles.main}
        onMouseMove={(e) => {
          setShowTb(Math.abs(e.clientY) < toolbarTriggerHeight);
          setShowDock(
            Math.abs(window.innerHeight - e.clientY) < dockTriggerHeight
          );
        }}
      >
        <Toolbar show={showTb}></Toolbar>
        <Dock show={showDock}></Dock>
        <Desktop></Desktop>
        <Windows></Windows>
      </main>
    </div>
  );
};

export default Home;
