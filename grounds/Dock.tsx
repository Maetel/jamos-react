import { useEffect, useState } from "react";
import { useAppSelector } from "../app/hooks";
import ProcMgr from "../features/procmgr/ProcMgr";
import SetMgr from "../features/settings/SetMgr";
import styles from "../styles/Dock.module.css";

export default function Dock(props) {
  const [clicked, setClicked] = useState(false);
  const [active, setActive] = useState(props.show);
  const show: boolean = active || clicked;
  const className = show ? styles.active : "";
  const colors = SetMgr.getInstance().themeReadable(useAppSelector).colors;

  const buildContainerStyle = () => {
    return {
      color: colors["2"],
      backgroundColor: `${colors["3"]}aa`,
    };
  };
  const containerStyle = buildContainerStyle();
  const front = ProcMgr.getInstance().front();

  return (
    <div
      className={`${styles.container} ${className}`}
      style={containerStyle}
      onMouseEnter={(e) => {
        setActive(true);
      }}
      onMouseLeave={(e) => {
        setActive(false);
      }}
      onClick={(e) => {
        setClicked(true);
      }}
    >
      <span className="item">{JSON.stringify(front?.["rect"])}</span>
      {/* <span className="left">JamOS Toolbar</span>
      <span className="right">
        <span className="rightitem">right item</span>
      </span> */}
    </div>
  );
}
