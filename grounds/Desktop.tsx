import React, { useState } from "react";
import { useEffect } from "react";
import FinderIcon from "../components/FinderIcon";
import { File } from "../features/file/FileTypes";
import Path from "../scripts/Path";

import styles from "../styles/Desktop.module.css";
import JamOS from "../features/JamOS/JamOS";
import { FinderCore, NodesView, NodesViewProps } from "../windows/Finder";

const backgroundImg = "/imgs/wall2.jpg";
const broomImg = "/imgs/broom.svg";

export default function Desktop(props) {
  const homeNodes = JamOS.filemgr.nodesReadable("~");

  const _colors = JamOS.theme.colors;
  // const proc = JamOS.procmgr.processValue("desktop");

  const nodesViewProps: NodesViewProps = {
    owner: "system",
    nodes: homeNodes,
  };

  useEffect(() => {
    console.log(
      `Home ${homeNodes.length}icons of ${homeNodes
        .map((node) => new Path(node.path).last)
        .join(", ")}`
    );
  }, [homeNodes]);

  return (
    <div id="desktop" className={styles.container}>
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
        {/* {homeNodes.map((node, i) => {
          return React.createElement(FinderIcon, {
            node: node,
            key: i,
            owner: "system",
          });
        })} */}
        <NodesView nodesViewProps={nodesViewProps}></NodesView>
      </div>
    </div>
  );
}
