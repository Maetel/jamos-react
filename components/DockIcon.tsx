import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../app/hooks";
import { Node } from "../features/file/FileTypes";
import Log from "../features/log/Log";
import ProcMgr from "../features/procmgr/ProcMgr";
import { getProcessCommandsIcon } from "../features/procmgr/ProcTypes";
import SetMgr from "../features/settings/SetMgr";
import Path from "../scripts/Path";
import { randomId } from "../scripts/utils";
import styles from "../styles/DockIcon.module.css";

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

  let contElem = useRef(null);
  const procmgr = ProcMgr.getInstance();

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
  const color1 = SetMgr.getInstance().color1(useAppSelector);
  const color2 = SetMgr.getInstance().color2(useAppSelector);
  const color3 = SetMgr.getInstance().color3(useAppSelector);

  useEffect(() => {
    contElem.current.style.overflow = hovered ? "show" : "hidden";
  }, [hovered]);
  return (
    <div
      className={styles.container}
      onClick={onIconClick}
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
        <Image
          src={src}
          alt={`Dock icon of ${type}`}
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
      {isOpen ? (
        <div
          className={`${styles.dot}`}
          style={{ backgroundColor: color1 }}
        ></div>
      ) : undefined}
    </div>
  );
}
