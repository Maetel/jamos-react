import { useEffect, useState } from "react";
import { useAppSelector } from "../app/hooks";
import { selectFile, selectNode } from "../features/file/fileSlice";
import { Node } from "../features/file/FileTypes";
import Log from "../features/log/Log";
import ProcMgr from "../features/procmgr/ProcMgr";
import Path from "../scripts/Path";
import { randomId } from "../scripts/utils";
import styles from "../styles/FinderIcon.module.css";

const abbreviate = (path: string) => {
  const max = 15;
  return path.slice(0, max) + (path.length > max ? "..." : "");
};

export default function FinderIcon(props) {
  const procmgr = ProcMgr.getInstance();
  const nodepath: string = props.node.path;
  const node: Node = useAppSelector(selectNode(nodepath));
  if (!node) {
    Log.warn("No such file : " + nodepath);
    return;
  }
  const src: string = node.iconPath;
  const width = 90;
  const imgContainerStyle = {
    width: width,
    height: width,
    borderRadius: width / 2,
  };
  const [hovered, setHovered] = useState(false);

  let contElem: HTMLElement, highElem: HTMLElement, descElem: HTMLElement;
  let contElemId = randomId(),
    highElemId = randomId(),
    descElemId = randomId();
  const setElems = () => {
    contElem = document.querySelector(`#${contElemId}`);
    highElem = document.querySelector(`#${highElemId}`);
    descElem = document.querySelector(`#${descElemId}`);
  };
  useEffect(() => {
    setElems();
  }, []);

  const hoverIn = () => {
    if (!contElem) {
      setElems();
    }
    setHovered(true);
    contElem.style.overflow = "show";
  };
  const hoverOut = () => {
    if (!contElem) {
      setElems();
    }
    setHovered(false);
    contElem.style.overflow = "hidden";
  };

  const filename = new Path(node.path).last;
  const dispFilename = hovered ? filename : abbreviate(filename);

  return (
    <div
      className={styles.container}
      id={contElemId}
      onClick={(e) => {
        procmgr.exeFile(new Path(node.path));
      }}
      onMouseEnter={hoverIn}
      onMouseLeave={hoverOut}
    >
      <span className={styles.highlight} id={highElemId} />
      <div className={styles.imgContainer} style={imgContainerStyle}>
        <img
          src={src}
          alt={`${node.type} icon of ${node.path}`}
          className={styles.windowIcon}
        />
      </div>
      <div className={styles.desc} id={descElemId}>
        {dispFilename}
      </div>
    </div>
  );
}
