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

const DockIconSeparator: DockIconProp = {
  type: "",
  onClickDefault: (e) => {},
  separator: true,
};

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

  const initialItems: DockIconProp[] = [
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
    { ...DockIconSeparator },
  ];

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
    setItems(initialItems);
  }, []);

  useEffect(() => {
    let keys = 0;
    for (let key in groups) {
      // console.log(` - ${key} : ${groups[key].length}`);
      keys++;
    }
    const setInitialItems = keys === 0;

    // setItems(initialItems);
    /////// build groups
    // for (let key in groups) {
    //   console.log("groups.key : ", key);
    // }
    // setItems((items: DockIconProp[]) => {
    //   //
    // return;
    // console.log("1");
    setItems((items: DockIconProp[]) => {
      if (setInitialItems) {
        return [...initialItems];
      }
      items = items.map((item) => {
        if (groups[item.type]) {
          item.isOpen = true;
          item.onClick = (e) => {
            procmgr.setFront(groups[item.type].at(0).id);
          };
        } else if (initialItems.some((item) => !!groups[item.type])) {
          item.isOpen = false;
          item.onClick = undefined;
        } else {
        }
        return item;
      });

      // for un-initials
      for (let procType in groups) {
        const _procs = groups[procType];
        if (initialItems.some((item) => item.type === procType)) {
          continue;
        }

        if (items.some((item) => item.type === procType)) {
          const idx = items.findIndex((item) => item.type === procType);
          items[idx].onClick = (e) => {
            procmgr.setFront(_procs.at(0).id);
          };
        } else {
          items.push({
            type: procType,
            onClickDefault: (e) => {
              procmgr.setFront(_procs.at(0).id);
            },
            isOpen: true,
          });
        }
      }
      // console.log("items.length:", items.length);
      items = items.filter(
        (item, i) =>
          initialItems.some((_item) => _item.type === item.type) ||
          item.isOpen ||
          (item.separator && i + 1 === items.length)
      );

      return items;
    });
    return;
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
        {items.map((item: DockIconProp, i) => {
          if (item.separator) {
            // return undefined;
            if (i === items.length - 1) {
              return undefined;
            }
            return (
              <div
                className={styles.separator}
                key={i}
                style={{
                  // height: "100%",
                  borderRight: `1px solid ${colors["1"]}aa`,
                }}
              ></div>
            );
          }
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
