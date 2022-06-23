import { useEffect, useState } from "react";
import { useAppSelector } from "../app/hooks";
import SetMgr from "../features/settings/SetMgr";
import styles from "../styles/Toolbar.module.css";

function ToolbarClock(props) {
  const [time, setTime] = useState(new Date().toLocaleString());
  useEffect(() => {
    const id = setInterval(() => {
      setTime(() => new Date().toLocaleString());
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, []);
  return <span className={styles.toolbarClock}>{time}</span>;
}

export default function Toolbar(props) {
  const [active, setActive] = useState(props.show);
  const show: boolean = props.show || active;
  const className = show ? styles.active : "";
  const colors = SetMgr.getInstance().themeReadable(useAppSelector).colors;

  const buildContainerStyle = () => {
    return {
      color: colors["2"],
      backgroundColor: colors["1"],
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
        <ToolbarClock></ToolbarClock>
      </span>
    </div>
  );
}
