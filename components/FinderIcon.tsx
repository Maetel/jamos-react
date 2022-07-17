import { useEffect, useRef, useState } from "react";
import { File, Node } from "../features/file/FileTypes";
import JamOS from "../features/JamOS/JamOS";
import Path from "../scripts/Path";
import styles from "../styles/FinderIcon.module.css";
import ShimmerImage from "./ShimmerImage";

const abbreviate = (path: string) => {
  const max = 15;
  return path.slice(0, max) + (path.length > max ? "..." : "");
};

export interface FinderIconProps {
  node: Node;
  onClick: (node) => void;
  owner: string;
}

export default function FinderIcon(props) {
  let contElem = useRef<HTMLDivElement>(null),
    highElem = useRef(null),
    descElem = useRef(null);
  const _props: FinderIconProps = props.finderIconProps;
  const owner: string = _props.owner; //owner process id | 'system'
  const procmgr = JamOS.procmgr;
  const nodepath: string = _props.node.path;
  const node: Node = JamOS.filemgr.nodeReadable(nodepath);
  const file: File = JamOS.filemgr.fileReadable(nodepath);

  const handleDragStart = (e) => {
    procmgr.set("system", { finderIconDragging: true });
    e.dataTransfer.setData("text/plain", node.path);
    e.dataTransfer.effectAllowed = "copy";
  };
  const handleDragEnd = (e) => {
    procmgr.set("system", { finderIconDragging: false });
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (node.type === "dir") {
      const fm = JamOS.filemgr;

      const from: string = e.dataTransfer.getData("text/plain");
      const to = node.path;

      if (from === to) {
        return;
      }

      if ((fm.fileExists(from) || fm.dirExists(from)) && fm.dirExists(to)) {
        const fromPath = new Path(from);
        const dest = from.replace(fromPath.parent, to);
        fm.mv(from, dest);
        JamOS.setNotif(`Moved ${from} to ${dest}`);
      }
    }
  };

  const [loading, setLoading] = useState(!false);
  // const node: Node = file?.node;
  const onClick: (node) => void =
    _props.onClick ??
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
    JamOS.closeAllContextMenus();
    JamOS.openContextMenu(
      e.pageX,
      e.pageY,
      ["Open", "__separator__", "Remove", "Rename"],
      [
        () => {
          onClick(node);
        },
        () => {
          const _path = new Path(nodepath);
          procmgr.openConfirm(
            owner,
            () => {
              console.log("Node:", node.type);
              if (node.type === "dir") {
                console.log("isdir");
                JamOS.filemgr.rmdir(_path.path);
              } else {
                console.log("else");
                JamOS.filemgr.rm(_path.path);
              }
            },
            {
              title: `Confirm remove`,
              descs: [`Remove ${_path.last}?`],
              buttons: ["Remove", "Cancel"],
            }
          );
        },
        () => {
          const _path = new Path(nodepath);
          procmgr.openTextModal(owner, {
            title: "Rename",
            descs: [`Rename from ${nodepath} to`],
            placeholder: _path.last,
            callbacks: [
              (params) => {
                const from = nodepath;
                const to = Path.join(_path.parent, params).path;
                JamOS.filemgr.mv(from, to);
              },
            ],
          });
        },
      ]
    );
  };

  useEffect(() => {
    if (contElem.current) {
      contElem.current.oncontextmenu = handleContext;
    }
  }, []);

  const handleDragOver = (e) => {
    // prevent dragOver to fire onDrop event
    e.stopPropagation();
    e.preventDefault();
    setHovered(true);
  };

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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrop={(e) => {
          handleDrop(e);
          setHovered(false);
        }}
        onDragOver={handleDragOver}
        onDragLeave={(e) => {
          setHovered(false);
        }}
        draggable={true}
      >
        <span
          className={styles.highlight}
          ref={highElem}
          style={{
            background: `linear-gradient(135deg, ${color1} 25%, ${color2} 60%, ${color3})`,
          }}
        />
        <div
          className={styles.imgContainer}
          style={imgContainerStyle}
          draggable={false}
        >
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
