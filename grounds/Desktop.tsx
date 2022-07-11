import React from "react";
import styles from "../styles/Desktop.module.css";
import JamOS from "../features/JamOS/JamOS";
import {
  handleFinderIconDrop,
  NodesView,
  NodesViewProps,
} from "../windows/Finder";

const backgroundImg = "/imgs/wall2.jpg";
const broomImg = "/imgs/broom.svg";

export default function Desktop(props) {
  const filemgr = JamOS.filemgr;
  const homeNodes = JamOS.filemgr.nodesReadable("~");

  const _colors = JamOS.theme.colors;
  // const proc = JamOS.procmgr.processValue("desktop");

  const nodesViewProps: NodesViewProps = {
    owner: "system",
    nodes: homeNodes,
  };
  const handleDrop = handleFinderIconDrop("system");

  return (
    <div
      id="desktop"
      className={styles.container}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={handleDrop}
    >
      <div className={styles.bgImageWrapper}>
        <img
          className={styles.bgImage}
          src={backgroundImg}
          alt="Desktop background"
        />
        <div
          className={styles.behindImage}
          style={{ backgroundColor: _colors["1"] }}
        />
      </div>
      <div className={styles.iconContainer}>
        <NodesView nodesViewProps={nodesViewProps}></NodesView>
      </div>
    </div>
  );
}
