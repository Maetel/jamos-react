import { useEffect, useState } from "react";
import { useAppSelector } from "../app/hooks";
import SetMgr from "../features/settings/SetMgr";
import styles from "../styles/Dock.module.css";

export default function Dock(props) {
  const [active, setActive] = useState(props.show);
  const show: boolean = props.show || active;
  const className = show ? styles.active : "";
  const colors = SetMgr.getInstance().themeReadable(useAppSelector).colors;

  const buildContainerStyle = () => {
    return {
      color: colors["2"],
      backgroundColor: `${colors["3"]}aa`,
    };
  };
  const containerStyle = buildContainerStyle();

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
    >
      <span className="left">JamOS Toolbar</span>
      <span className="right">
        <span className="rightitem">right item</span>
      </span>
    </div>
  );
}