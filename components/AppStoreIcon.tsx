import Image from "next/image";
import { useState } from "react";
import { File } from "../features/file/FileTypes";
import JamOS from "../features/JamOS/JamOS";
import Path from "../scripts/Path";
import styles from "../styles/AppStoreIcon.module.css";
import ShimmerImage from "./ShimmerImage";

export default function AppStoreIcon(props) {
  const file: File = props.file;
  const filemgr = JamOS.filemgr;
  let updateExists = () => {
    return filemgr.fileExists(file.node.path);
  };
  const [exists, setExists] = useState(updateExists());
  const _colors = JamOS.theme.colors;

  const onClick = (e) => {
    if (filemgr.fileExists(file.node.path)) {
      //remove;
      filemgr.rm(file.node.path);
    } else {
      filemgr.addFile(file);
    }
    setExists(updateExists());
  };

  return (
    <div className={`${styles["item-container"]}`}>
      <div className={`${styles.item}`} onClick={onClick}>
        <div className={`${styles["image-container"]}`}>
          <ShimmerImage
            width="100%"
            height="100%"
            className={`${styles.icon}`}
            src={file.node.iconPath}
            alt={file.node.path}
          />
        </div>
        <div className={`${styles.name}`}>{new Path(file.node.path).last}</div>
        <span className={`${styles["icon-container"]}`}>
          {exists ? (
            <ShimmerImage
              width="100%"
              height="100%"
              src="/imgs/circlecheck.svg"
              alt="App installed on desktop"
              className={`${styles.icon}`}
              style={{ backgroundColor: `${_colors["okay"]}aa` }}
            />
          ) : (
            <ShimmerImage
              width="100%"
              height="100%"
              src="/imgs/circledash.svg"
              alt="App not installed"
              className={`${styles.icon}`}
              style={{ backgroundColor: `${_colors["warn"]}aa` }}
            />
          )}
        </span>
      </div>
    </div>
  );
}
