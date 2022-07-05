import Image from "next/image";
import { useState } from "react";
import { File } from "../features/file/FileTypes";
import JamOS from "../features/JamOS/JamOS";
import Path from "../scripts/Path";
import styles from "../styles/AppStoreIcon.module.css";

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
        <span className={`${styles["icon-container"]}`}>
          {exists ? (
            <Image
              src="/imgs/circlecheck.svg"
              alt="App installed on desktop"
              className={`${styles.icon}`}
              style={{ backgroundColor: `${_colors["okay"]}aa` }}
            />
          ) : (
            <Image
              src="/imgs/circledash.svg"
              alt="App not installed"
              className={`${styles.icon}`}
              style={{ backgroundColor: `${_colors["warn"]}aa` }}
            />
          )}
        </span>

        <div className={`${styles["Image-container"]}`}>
          <Image
            className={`${styles.icon}`}
            src={file.node.iconPath}
            alt={file.node.path}
          />
        </div>
        <div className={`${styles.name}`}>{new Path(file.node.path).last}</div>
      </div>
    </div>
  );
}
