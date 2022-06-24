import { iteratorSymbol } from "immer/dist/internal";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../app/hooks";
import Log from "../features/log/Log";
import ProcMgr from "../features/procmgr/ProcMgr";
import SetMgr from "../features/settings/SetMgr";
import { ToolbarItem, ToolbarItemId } from "../scripts/ToolbarTypes";

import styles from "../styles/Toolbar.module.css";

type TbItem = ToolbarItem;
type TbMenu = { menu: string; items: TbItem[] };
type TbProc = TbMenu[];

const systemMenu: ToolbarItem[] = [
  {
    caller: "system",
    menu: "🍞",
    item: "About JamOS",
    callback: "system.proc.add.about",
    separator: true,
  },
  {
    caller: "system",
    menu: "🍞",
    item: "Settings",
    callback: "system.proc.add.settings",
  },
  {
    caller: "system",
    menu: "🍞",
    item: "System Monitor",
    callback: "system.proc.add.systeminfo",
  },
  {
    caller: "system",
    menu: "🍞",
    item: "AppStore",
    callback: "system.proc.add.appstore",
    separator: true,
  },
  {
    caller: "system",
    menu: "🍞",
    item: "Terminal",
    callback: "system.proc.add.terminal",
    separator: true,
  },
  {
    caller: "system",
    menu: "🍞",
    item: "Close all windows",
    callback: "system.proc.killall.system",
  },
];

export class ToolbarControl {
  private static instance: ToolbarControl;
  private constructor() {}

  private _systemCallbackParser(query: string) {
    const q = query.toLowerCase().trim();
    const qs = q.split(".");
    const caller = qs.at(0); //must be system

    const cmd = qs.at(1);
    const func = qs.at(2);
    const params = qs.at(3);

    const procmgr = ProcMgr.getInstance();
    // debugger;
    if (cmd === "proc") {
      switch (func) {
        case "add":
          procmgr.add(params);
          return;
        case "killall":
          procmgr.killAll(params);
          return;
        case "kill":
          procmgr.kill(params);
          return;
        default:
          break;
      }
    }
    Log.error(`ToolbarControl system command ${query} does not exist`);
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new ToolbarControl();
    }
    return this.instance;
  }
  // callbacks[procId][menu][item]
  // public static callbacks: {
  //   [key: string]: { [key: string]: { [key: string]: () => void } };
  // } = {};
  public static callbacks: { [key: string]: () => void } = {};

  public register(item: ToolbarItem, callback: () => void) {
    const id = ToolbarItemId(item);
    ToolbarControl.callbacks[id] = callback;
    ProcMgr.getInstance().setToolbarItem(item.caller, item);
  }

  public unregister(procId: string) {
    let deleteCount = 0;
    for (let key in ToolbarControl.callbacks) {
      if (key.startsWith(procId)) {
        delete ToolbarControl.callbacks.key;
        deleteCount++;
      }
    }
    Log.log(`Toolbar unregister id[${procId}] of ${deleteCount} toolbar items`);
  }
  public unregisterItem(item: ToolbarItem) {
    for (let key in ToolbarControl.callbacks) {
      if (key === ToolbarItemId(item)) {
        delete ToolbarControl.callbacks.key;
      }
    }
  }
  public execute(item: ToolbarItem) {
    const callback = ToolbarItemId(item);
    console.log("callback:", callback);
    if (callback.startsWith("system")) {
      this._systemCallbackParser(item.callback);
      return;
    }
    ToolbarControl.callbacks[callback]?.();
    if (!ToolbarControl.callbacks[callback]) {
      Log.error(`Toolbar callback does not exist for : ${callback}`);
    }
  }
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
  const item: ToolbarItem = props.item;
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
        // ProcMgr.getInstance().front()?.[item.callback]?.();
        // ToolbarControl.getInstance().execute("system", item.menu, item.item);
        ToolbarControl.getInstance().execute(item);
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
      {item.item}
    </span>
  );
}

function CollapsibleMenu(props) {
  const menu: TbMenu = props.menu;
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
    setPosX(`${e.target.getBoundingClientRect().x}px`);
    props.menuActivate?.();
    setCollActive(true);
  };

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
        className={`${styles.collMenu}`}
        onClick={onTitleClick}
        ref={collMenuElem}
        style={titleStyle}
      >
        {menu.menu}
      </span>
      <div className={`${styles.items} ${itemClassName}`} style={itemsStyle}>
        {menu.items.map((item, i) => (
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
  const [isEdge, setIsEdge] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(null);
  const show: boolean = isEdge || hovered || clicked !== null;
  const className = show ? styles.active : "";
  const colors = SetMgr.getInstance().themeReadable(useAppSelector).colors;

  const front = ProcMgr.getInstance().front();
  const frontMenus: ToolbarItem[] = front?.["toolbar"];

  // console.log("FrontMenus:", frontMenus);

  useEffect(() => {
    const toolbarTriggerHeight = 3;
    const dockTriggerHeight = 20;
    const detectEdge = (e) => {
      setIsEdge(Math.abs(e.clientY) < toolbarTriggerHeight);
    };
    window.addEventListener("mousemove", detectEdge);
    return () => {
      window.removeEventListener("mousemove", detectEdge);
    };
  }, []);

  const buildContainerStyle = () => {
    return {
      color: colors["2"],
      backgroundColor: colors["1"],
    };
  };
  const containerStyle = buildContainerStyle();

  const procmgr = ProcMgr.getInstance();

  const _parseItems = (items: TbItem[]): TbProc => {
    const retval: TbMenu[] = [{ menu: "🍞", items: systemMenu }];
    return retval;
  };
  const parseItems = (items: TbItem[]): TbProc => {
    const retval: TbMenu[] = [{ menu: "🍞", items: systemMenu }];
    if (!items || items.length === 0) {
      if (!front || !front.name) {
        return retval;
      }
      {
        //registering here causes warning :
        /*
        'Cannot update a component (`Toolbar`) while rendering a different component (`Toolbar`). To locate the bad setState() call inside `Toolbar`'
        */
        // const register = (menu, item, cb, seperator?: boolean) => {
        //   const data: ToolbarItem = {
        //     caller: front.id,
        //     menu: menu,
        //     item: item,
        //   };
        //   if (seperator) {
        //     data.separator = seperator;
        //   }
        //   ToolbarControl.getInstance().register(data, cb);
        // };
        // register(
        //   front.name,
        //   `Quit ${front.name}`,
        //   () => {
        //     procmgr.kill(front.id);
        //     // addHelp();
        //   },
        //   true
        // );
      }
    }
    const menus: { [key: string]: TbItem[] } = {};
    items
      // .filter((item) => item.caller === procId)
      .forEach((item) => {
        if (!menus[item.menu]) {
          menus[item.menu] = [item];
        } else {
          menus[item.menu].push(item);
        }
      });

    for (let menu in menus) {
      retval.push({ menu: menu, items: menus[menu] });
    }

    return retval;
  };
  const tbproc = parseItems(frontMenus);
  const [menus, setMenus] = useState(tbproc);
  useEffect(() => {
    console.log("frontMenus update :", frontMenus);
    const _tbproc = parseItems(frontMenus);
    setMenus(_tbproc);
  }, [frontMenus]);

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
        className={styles.edge}
        onMouseEnter={(e) => {
          // console.log("mouse enter");
          // setIsEdge(true);
        }}
        onMouseLeave={(e) => {
          // setIsEdge(false);
        }}
      ></div>
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
          {menus.map((menu, i) => {
            return (
              <CollapsibleMenu
                menu={menu}
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
