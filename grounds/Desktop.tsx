import React from "react";
import { useEffect } from "react";
import { useAppSelector } from "../app/hooks";
import FinderIcon from "../components/FinderIcon";
import { selectNodesInDir } from "../features/file/fileSlice";
import SetMgr from "../features/settings/SetMgr";
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
    contElem = contElem ?? document.querySelector(`#desktop`);
    broomElem = broomElem ?? document.querySelector(`#broom-image`);
    imageElem = imageElem ?? document.querySelector(`#${imageElemId}`);
    imageWrapperElem =
      imageWrapperElem ?? document.querySelector(`#${imageWrapperElemId}`);
  };
  useEffect(() => {
    setElems();
  }, []);

  const homeNodes = useAppSelector(selectNodesInDir("~/"));
  const theme = SetMgr.getInstance().themeReadable(useAppSelector);
  const _colors = theme.colors;

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
        <div
          className={styles.behindImage}
          id={imageWrapperElemId}
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
