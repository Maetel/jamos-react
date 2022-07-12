import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import CallbackStore from "../features/JamOS/Callbacks";
import JamOS from "../features/JamOS/JamOS";
import Process, {
  getProcessCommandsIcon,
  ProcessTypeName,
} from "../features/procmgr/ProcTypes";
import styles from "../styles/DockIcon.module.css";
import ShimmerImage from "./ShimmerImage";

export interface DockIconProp {
  type: string;
  onClick?: (Event) => void;
  onClickDefault: (Event) => void;
  isOpen?: boolean;
  separator?: boolean;
}

export default function DockIcon(props) {
  // type, iconPath, onClick?
  const { type, onClick, onClickDefault, isOpen } = props.props as DockIconProp;
  const onIconClick = onClick ?? onClickDefault;
  const src = getProcessCommandsIcon(type);

  let contElem = useRef<HTMLDivElement>(null);
  const procmgr = JamOS.procmgr;

  // if (!node) {
  //   Log.warn("No such file : " + nodepath);
  //   return;
  // }
  const width = 60;
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
  const procsOfType: Process[] = procmgr.processOfType(type);

  const handleContext = (e) => {
    e.preventDefault();
    JamOS.closeAllContextMenus();

    let menus, callbacks;
    if (procsOfType.length === 0) {
      // console.log("Added JamOS.procmgr.closeDock()");
      menus = [`Open ${ProcessTypeName(type)}`];
      callbacks = [
        () => {
          procmgr.add(type);
        },
      ];
    } else {
      // console.log("Added JamOS.procmgr.closeDock()");
      menus = [
        ...procsOfType.map((_proc) => _proc.desc ?? _proc.name),
        "__separator__",
        "Close all",
      ];
      callbacks = [
        ...procsOfType.map((_proc) => () => {
          procmgr.setFront(_proc.id);
        }),
        () => {
          procmgr.killAllofType(type);
        },
      ];
    }

    const rect = contElem.current.getBoundingClientRect();
    const topOffset = 10;
    const x = rect.left / window.innerWidth < 0.5 ? rect.left : rect.right;
    const y = rect.top - topOffset;

    const cbMount = "system/DockIcon/onContextMenuMount";
    const cbDestroy = "system/DockIcon/onContextMenuDestroy";
    CallbackStore.register(cbMount, () => {
      JamOS.forceOpenDock(true);
    });
    CallbackStore.register(cbDestroy, () => {
      JamOS.forceOpenDock(false);
    });
    JamOS.openContextMenu(x, y, menus, callbacks, {
      onMount: cbMount,
      onDestroy: cbDestroy,
    });
  };

  useEffect(() => {
    contElem.current.oncontextmenu = handleContext;
  }, [procsOfType, hovered]);

  useEffect(() => {
    contElem.current.style.overflow = hovered ? "show" : "hidden";
  }, [hovered]);
  return (
    <div
      className={styles.container}
      onClick={(e) => {
        onIconClick(e);
        JamOS.closeAllContextMenus();
      }}
      onMouseOver={(e) => {
        setHovered(true);
      }}
      onMouseOut={(e) => {
        setHovered(false);
      }}
      style={{ color: color1 }}
      ref={contElem}
    >
      <span
        className={styles.highlight}
        style={{
          background: `linear-gradient(135deg, ${color1} 25%, ${color2} 60%, ${color3})`,
        }}
      />
      <div className={styles.imgContainer} style={imgContainerStyle}>
        <ShimmerImage
          src={src}
          alt={`Dock icon of ${type}`}
          objectFit="contain"
          objectPosition={"center center"}
          width={"70%"}
          height={"70%"}
        ></ShimmerImage>
      </div>
      {isOpen ? (
        <div
          className={`${styles.dot}`}
          style={{ backgroundColor: color1 }}
        ></div>
      ) : undefined}
    </div>
  );
}
