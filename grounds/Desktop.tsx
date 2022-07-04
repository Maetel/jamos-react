import React, { useState } from "react";
import { useEffect } from "react";
import FinderIcon from "../components/FinderIcon";
import { File } from "../features/file/FileTypes";

import styles from "../styles/Desktop.module.css";
import JamOS from "../features/JamOS/JamOS";

const backgroundImg = "/imgs/wall2.jpg";
const broomImg = "/imgs/broom.svg";

export default function Desktop(props) {
  const homeNodes = JamOS.filemgr.nodesReadable("~");

  const _colors = JamOS.theme.colors;

  return (
    <div id="desktop" className={styles.container}>
      <img
        id="broom-image"
        className={styles.broomImage}
        src={broomImg}
        alt="Broom effect"
      />
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
        {/* {#each $nodes as node (node.node.id)}
      <FinderIcon fileNode={node.node} />
    {/each} */}
        {homeNodes.map((node, i) => {
          return React.createElement(FinderIcon, { node: node, key: i });
        })}
      </div>
    </div>
  );
}
