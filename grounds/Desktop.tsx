import React from "react";
import { useEffect } from "react";
import { useAppSelector } from "../app/hooks";
import FinderIcon from "../components/FinderIcon";
import { selectNodesInDir } from "../features/file/fileSlice";
import { randomId } from "../scripts/utils";

import styles from "../styles/Desktop.module.css";

const backgroundImg = "/imgs/wall2.jpg";
const broomImg = "/imgs/broom.svg";

export default function Desktop(props) {
  let contElem: HTMLElement,
    broomElem: HTMLElement,
    imageElem: HTMLElement,
    imageWrapperElem: HTMLElement;
  let imageElemId = randomId(),
    imageWrapperElemId = randomId();
  const setElems = () => {
    contElem = document.querySelector(`#desktop`);
    broomElem = document.querySelector(`#broom-image`);
    imageElem = document.querySelector(`#${imageElemId}`);
    imageWrapperElem = document.querySelector(`#${imageWrapperElemId}`);
  };
  useEffect(() => {
    setElems();
  }, []);

  const homeNodes = useAppSelector(selectNodesInDir("~/"));

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
          id={imageElemId}
        />
        <div className={styles.behindImage} id={imageWrapperElemId} />
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
