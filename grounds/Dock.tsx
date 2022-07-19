import { useEffect, useRef, useState } from "react";
import styles from "../styles/Dock.module.css";

import DockIcon, { DockIconProp } from "../components/DockIcon";
import React from "react";
import JamOS from "../features/JamOS/JamOS";
import CallbackStore from "../features/JamOS/CallbackStore";

const DockIconSeparator: DockIconProp = {
  type: "",
  onClickDefault: (e) => {},
  separator: true,
};

export default function Dock(props) {
  const debugMode = !true;
  const procmgr = JamOS.procmgr;
  const [isEdge, setIsEdge] = useState(false);
  const [hovered, setHovered] = useState(false);
  const fixed = JamOS.isDockFixed();
  const openForced = JamOS.isDockOpenForced();
  const isOpen = openForced || fixed;
  const hiddenForced = JamOS.isDockHiddenForced(); // hide preceeds open
  // console.log(
  //   `fixed:${fixed} hiddenForced:${hiddenForced} openForced:${openForced}`
  // );
  const show: boolean = isEdge || hovered;
  const className = show || (!hiddenForced && isOpen) ? styles.active : "";
  const colors = JamOS.theme.colors;
  // const groups = procmgr.groupedProcs();
  const groups = procmgr.groupedProcsForDock();
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
      // console.log(` - groups[${key}]=`, groups[key].at(0)?.comp);
      keys++;
    }
    const setInitialItems = keys === 0;

    setItems((items: DockIconProp[]) => {
      if (setInitialItems) {
        return [...initialItems];
      }

      // for initials
      items = items.map((item) => {
        if (groups[item.type]) {
          // if is open
          item.isOpen = true;
          item.onClick = (e) => {
            groups[item.type].forEach((proc) => {
              procmgr.setFront(proc.id);
            });
          };
        } else if (initialItems.some((item) => !!groups[item.type])) {
          // if none open
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
            _procs.forEach((proc) => {
              procmgr.setFront(proc.id);
            });
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
  }, [groups]);

  const buildContainerStyle = () => {
    return {
      color: colors["2"],
      // backgroundColor: `${colors["3"]}77`,
    };
  };
  const containerStyle = buildContainerStyle();

  const handleContext = (e) => {
    const cl = (e.target as HTMLElement).classList;
    if (cl.contains(styles.dock)) {
      e.preventDefault();
      JamOS.closeAllContextMenus();
      const isDockOpen = JamOS.isDockFixedValue();

      const rect = contElem.current.getBoundingClientRect();
      const topOffset = 10;
      const y = rect.top - topOffset;

      const cbMount = "system/DockIcon/onContextMenuMount";
      const cbDestroy = "system/DockIcon/onContextMenuDestroy";
      CallbackStore.register(cbMount, () => {
        JamOS.forceOpenDock(true);
      });
      CallbackStore.register(cbDestroy, () => {
        JamOS.forceOpenDock(false);
      });

      JamOS.openContextMenu(
        e.pageX,
        y,
        [isDockOpen ? "Hide dock" : "Fix dock"],
        [
          () => {
            if (isDockOpen) {
              JamOS.closeDock();
            } else {
              JamOS.openDock();
            }
          },
        ],
        {
          onMount: cbMount,
          onDestroy: cbDestroy,
        }
      );
    }
  };

  useEffect(() => {
    if (contElem.current) {
      console.log("registered");
      contElem.current.oncontextmenu = handleContext;
    }
  }, []);

  const contElem = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`${styles.container} ${className}`}
      ref={contElem}
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
