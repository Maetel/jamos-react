import { useEffect, useRef, useState } from "react";
import { File, Node } from "../features/file/FileTypes";
import JamOS from "../features/JamOS/JamOS";
import Path from "../scripts/Path";
import styles from "../styles/FinderIcon.module.css";
import ShimmerImage from "./ShimmerImage";
import hash from "object-hash";
import CallbackStore from "../features/JamOS/Callbacks";

const abbreviate = (path: string) => {
  const max = 15;
  return path.slice(0, max) + (path.length > max ? "..." : "");
};

export default function FinderIcon(props) {
  let contElem = useRef<HTMLDivElement>(null),
    highElem = useRef(null),
    descElem = useRef(null);

  const procmgr = JamOS.procmgr;
  const nodepath: string = props.node.path;
  const node: Node = JamOS.filemgr.nodeReadable(nodepath);
  const file: File = JamOS.filemgr.fileReadable(nodepath);
  const [loading, setLoading] = useState(!false);
  // const node: Node = file?.node;
  const onClick: (Event) => void =
    props.onClick ??
    function (node: Node) {
      procmgr.exeFile(new Path(node.path));
    };
  // if (!node) {
  //   Log.warn("No such file : " + nodepath);
  //   return;
  // }
  const setSrc = () => {
    if (node.type === "image") {
      return file?.data["src"] ?? node.iconPath;
    }
    return node.iconPath;
  };
  const src: string = setSrc();
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
    contElem.current.style.overflow = hoverIn ? "show" : "hidden";
  };

  const filename = new Path(node.path).last;
  const dispFilename = hovered ? filename : abbreviate(filename);

  const handleContext = (e) => {
    e.preventDefault();
    JamOS.openContextMenu(
      e,
      ["Open", "__separator__", "Rename"],
      [
        () => {
          console.log("Onclick:");
          onClick(node);
        },
        () => {
          console.log("Rename");
        },
      ]
    );
  };

  useEffect(() => {
    contElem.current.oncontextmenu = handleContext;
  }, []);

  return (
    node && (
      <div
        className={styles.container}
        ref={contElem}
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
          ref={highElem}
          style={{
            background: `linear-gradient(135deg, ${color1} 25%, ${color2} 60%, ${color3})`,
          }}
        />
        <div className={styles.imgContainer} style={imgContainerStyle}>
          <ShimmerImage
            src={src}
            alt={`${node.type} icon of ${node.path}`}
            onLoad={(e) => {
              // console.log("e:", e);
              setLoading(!true);
            }}
            onLoadingComplete={(e) => {
              setLoading(false);
            }}
            objectFit="contain"
            objectPosition={"center center"}
            width={"70%"}
            height={"70%"}
          ></ShimmerImage>
        </div>
        <div
          className={styles.desc}
          ref={descElem}
          style={{ backgroundColor: `${color2}cc` }}
        >
          {dispFilename}
        </div>
      </div>
    )
  );
}
