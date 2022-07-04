import Image from "next/image";
import { useEffect, useState } from "react";
import { Node } from "../features/file/FileTypes";
import JamOS from "../features/JamOS/JamOS";
import Path from "../scripts/Path";
import { randomId } from "../scripts/utils";
import styles from "../styles/FinderIcon.module.css";

const abbreviate = (path: string) => {
  const max = 15;
  return path.slice(0, max) + (path.length > max ? "..." : "");
};

const windowIconStyle = {
  display: "inline-block",
  borderRadius: "5px",
  width: "70%",
  height: "70%",
  /* background-color: #dbdbdb; */
  objectFit: "contain",
  objectPosition: "center center",
};

export default function FinderIcon(props) {
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

  const procmgr = JamOS.procmgr;
  const nodepath: string = props.node.path;
  const node: Node = JamOS.filemgr.nodeReadable(nodepath);
  const onClick: (Event) => void =
    props.onClick ??
    function (node: Node) {
      procmgr.exeFile(new Path(node.path));
    };
  // if (!node) {
  //   Log.warn("No such file : " + nodepath);
  //   return;
  // }
  const src: string = node.iconPath;
  const width = 90;
  const imgContainerStyle = {
    width: width,
    height: width,
    borderRadius: width / 2,
  };
  const [hovered, setHovered] = useState(false);
  const colors = JamOS.theme.colors;
  const color1 = colors["1"];
  const color2 = colors["2"];
  const color3 = colors["3"];

  const callHover = (e, hoverIn) => {
    setHovered(hoverIn);
    if (!contElem) {
      setElems();
    }
    contElem.style.overflow = hoverIn ? "show" : "hidden";
  };

  const filename = new Path(node.path).last;
  const dispFilename = hovered ? filename : abbreviate(filename);

  return node ? (
    <div
      className={styles.container}
      id={contElemId}
      onClick={(e) => {
        onClick(node);
      }}
      onMouseOver={(e) => {
        callHover(e, true);
      }}
      onMouseOut={(e) => {
        callHover(e, false);
      }}
      style={{ color: color1 }}
    >
      <span
        className={styles.highlight}
        id={highElemId}
        style={{
          background: `linear-gradient(135deg, ${color1} 25%, ${color2} 60%, ${color3})`,
        }}
      />
      <div className={styles.imgContainer} style={imgContainerStyle}>
        <Image
          src={src}
          alt={`${node.type} icon of ${node.path}`}
          style={{
            display: "inline-block",
            borderRadius: "5px",
            // width: "70%",
            // height: "70%",
            /* background-color: #dbdbdb; */
            objectFit: "contain",
            objectPosition: "center center",
          }}
          width={"70%"}
          height={"70%"}
        ></Image>
      </div>
      <div
        className={styles.desc}
        id={descElemId}
        style={{ backgroundColor: `${color2}cc` }}
      >
        {dispFilename}
      </div>
    </div>
  ) : undefined;
}
