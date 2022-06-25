import { useEffect, useState } from "react";
import { useAppSelector } from "../app/hooks";
import ProcMgr from "../features/procmgr/ProcMgr";
import SetMgr from "../features/settings/SetMgr";
import styles from "../styles/Dock.module.css";

import DockIcon, { DockIconProp } from "../components/DockIcon";
import React from "react";

function DockItem(props) {
  return (
    <div className={`${styles.dockitem}`}>
      <DockIcon></DockIcon>
    </div>
  );
}

export default function Dock(props) {
  const debugMode = !true;
  const procmgr = ProcMgr.getInstance();
  const [isEdge, setIsEdge] = useState(false);
  const [hovered, setHovered] = useState(false);
  const show: boolean = isEdge || hovered || debugMode;
  const className = show ? styles.active : "";
  const colors = SetMgr.getInstance().themeReadable(useAppSelector).colors;
  const groups = procmgr.groupedProcs();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const _mouseEdgeDetect = () => {
      const dockTriggerHeight = 20;
      const detectEdge = (e) => {
        setIsEdge(Math.abs(e.clientY - window.innerHeight) < dockTriggerHeight);
      };
      window.addEventListener("mousemove", detectEdge);
      return () => {
        window.removeEventListener("mousemove", detectEdge);
      };
    };
    _mouseEdgeDetect();

    /////////////////////////// set initial items
    setItems([
      {
        type: "finder",
        onClickDefault: (e) => {
          procmgr.exeCmd("finder ~");
        },
      },
      {
        type: "terminal",
        onClickDefault: (e) => {
          procmgr.add("terminal");
        },
      },
      {
        type: "styler",
        onClickDefault: (e) => {
          procmgr.add("styler");
        },
      },
    ]);
  }, []);

  useEffect(() => {
    /////// build groups
    for (let key in groups) {
      console.log("groups.key : ", key);
    }
    setItems((items: DockIconProp[]) => {
      return items.map((item) => {
        if (groups[item.type]) {
          item.isOpen = true;
          item.onClick = (e) => {
            procmgr.setFront(groups[item.type].at(0).id);
          };
        } else {
          item.isOpen = false;
          item.onClick = undefined;
        }
        return item;
      });
    });
  }, [groups]);

  const buildContainerStyle = () => {
    return {
      color: colors["2"],
      // backgroundColor: `${colors["3"]}77`,
    };
  };
  const containerStyle = buildContainerStyle();
  const front = ProcMgr.getInstance().front();

  return (
    <div
      className={`${styles.container} ${className}`}
      style={containerStyle}
      onMouseEnter={(e) => {
        setHovered(true);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
      }}
    >
      <div
        className={`${styles.dock}`}
        style={{
          backgroundColor: `${colors["2"]}22`,
          boxShadow: `2px 2px 10px ${colors["1"]}`,
        }}
      >
        {items.map((item, i) => {
          return React.createElement(DockIcon, {
            props: item,
            key: i,
          });
        })}
      </div>

      {/* <span className="left">JamOS Toolbar</span>
      <span className="right">
        <span className="rightitem">right item</span>
      </span> */}
    </div>
  );
}
