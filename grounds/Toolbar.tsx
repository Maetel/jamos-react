import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../app/hooks";
import ProcMgr from "../features/procmgr/ProcMgr";
import SetMgr from "../features/settings/SetMgr";
import styles from "../styles/Toolbar.module.css";

export interface CollapsibleMenu {
  title: string;
  items: CollapsibleItem[];
}
export interface CollapsibleItem {
  name: string;
  disabled?: boolean;
  callback?: () => void;
  separator?: boolean;
}

function ToolbarClock(props) {
  const [time, setTime] = useState("");
  useEffect(() => {
    setTime(new Date().toLocaleString());
    const id = setInterval(() => {
      setTime(() => new Date().toLocaleString());
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, []);
  return <span className={styles.toolbarClock}>{time}</span>;
}

function MenuItem(props) {
  const item: CollapsibleItem = props.item;
  const disabled = item.disabled;
  const colors = SetMgr.getInstance().themeReadable(useAppSelector).colors;
  const [hovered, setHovered] = useState(false);
  const buildStyle = () => {
    const retval = {
      color: colors["2"],
      backgroundColor: colors["1"],
    };
    if (disabled) {
      // retval.color = colors["3"];
      retval["textDecoration"] = "underline";
      return retval;
    }
    if (hovered) {
      retval.color = colors["1"];
      retval.backgroundColor = colors["2"] + "aa";
    }
    if (item.separator) {
      retval["borderBottom"] = `1px solid ${colors["2"]}`;
    }
    return retval;
  };
  const style = buildStyle();
  return (
    <span
      className={styles.menuitem}
      onClick={(e) => {
        item.callback?.();
        props.uncollapse?.();
      }}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      style={style}
    >
      {item.name}
    </span>
  );
}

function CollapsibleMenu(props) {
  const menu: CollapsibleMenu = props.menu;
  const colors = SetMgr.getInstance().themeReadable(useAppSelector).colors;
  const collMenuElem = useRef(null);
  const [collActive, setCollActive] = useState(false);
  const isActive = collActive && props.clicked === props.id;
  const itemClassName = isActive ? styles.active : "";

  const [posX, setPosX] = useState(undefined);
  useEffect(() => {
    // setPosX(getComputedStyle(collMenuElem.current).left);
  }, []);
  const onTitleClick = (e) => {
    console.log("Ontitleclick x :", `${e.target.getBoundingClientRect().x}px`);
    setPosX(`${e.target.getBoundingClientRect().x}px`);
    setCollActive(true);
    props.menuActivate?.();
  };

  const items: CollapsibleItem[] = menu.items ?? [
    { name: "No item", disabled: true },
  ];

  const buildItemsStyle = () => {
    const retval = {
      left: posX,
      // width: 200,
      // height: `${Math.round(items.length * 1.6)}rem`,
      zIndex: 1002,
      backgroundColor: colors["1"],
      color: colors["2"],
      boxShadow: `1px 1px 20px ${colors["2"]}aa`,
    };
    retval["position"] = "fixed";
    return retval;
  };
  const buildTitleStyle = () => {
    return {
      color: colors[isActive ? "1" : "2"],
      backgroundColor: `${colors[isActive ? "2" : "1"]}aa`,
    };
  };
  const itemsStyle = buildItemsStyle();
  const titleStyle = buildTitleStyle();

  return (
    <>
      <span
        className={`${styles.collTitle}`}
        onClick={onTitleClick}
        ref={collMenuElem}
        style={titleStyle}
      >
        {menu.title}
      </span>
      <div className={`${styles.items} ${itemClassName}`} style={itemsStyle}>
        {items.map((item, i) => (
          <MenuItem
            key={i}
            item={item}
            uncollapse={props.uncollapse}
          ></MenuItem>
        ))}
      </div>
    </>
  );
}

export default function Toolbar(props) {
  const [hovered, setHovered] = useState(props.show);
  const [clicked, setClicked] = useState(null);
  const show: boolean = props.show || hovered || clicked !== null;
  const className = show ? styles.active : "";
  const colors = SetMgr.getInstance().themeReadable(useAppSelector).colors;

  const buildContainerStyle = () => {
    return {
      color: colors["2"],
      backgroundColor: colors["1"],
    };
  };
  const containerStyle = buildContainerStyle();

  const procmgr = ProcMgr.getInstance();
  const collapsibles: CollapsibleMenu[] = [
    {
      title: "🍞",
      items: [
        {
          name: "About JamOS",
          callback: () => {
            procmgr.add("about");
          },
          separator: true,
        },
        {
          name: "Settings",
          callback: () => {
            procmgr.add("settings");
          },
        },
        {
          name: "System Monitor",
          callback: () => {
            procmgr.add("systeminfo");
          },
        },
        {
          name: "AppStore",
          callback: () => {
            procmgr.add("bakery");
          },
          separator: true,
        },
        {
          name: "Terminal",
          callback: () => {
            procmgr.add("terminal");
          },
        },
        {
          name: "Close all windows",
          callback: () => {
            procmgr.killAll();
          },
        },
      ],
    },
  ];

  collapsibles.push(collapsibles[0]);

  const uncollapse = (e) => {
    setHovered(false);
    setClicked(null);
    window.removeEventListener("keydown", handleEscape);
  };
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      uncollapse(e);
    }
  };
  return (
    <>
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
        <span className={styles.left}>
          {collapsibles.map((coll, i) => {
            return (
              <CollapsibleMenu
                menu={coll}
                id={i}
                key={i}
                menuActivate={() => {
                  setClicked(i);
                  window.addEventListener("keydown", handleEscape);
                }}
                clicked={clicked}
                uncollapse={uncollapse}
              />
            );
          })}
        </span>
        <span className={styles.right}>
          <ToolbarClock></ToolbarClock>
        </span>
      </div>
      <div className={`${styles.bg} ${className}`} onClick={uncollapse}></div>
    </>
  );
}
