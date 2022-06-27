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
    separator: true,
  },
  {
    caller: "system",
    menu: "🍞",
    item: "Fix toolbar",
    callback: "system.proc.toolbar.open",
  },
  {
    caller: "system",
    menu: "🍞",
    item: "Fix dock",
    callback: "system.proc.dock.open",
    separator: true,
  },
  {
    caller: "system",
    menu: "🍞",
    item: "AppStore",
    callback: "system.proc.add.appstore",
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

export class RegisterBuilder {
  constructor(public procId: string) {}
  public register(
    menu,
    item,
    cb,
    additional?: {
      separator?: boolean;
      disabled?: boolean;
      order?: number;
      callback?: string;
    }
  ) {
    const data: ToolbarItem = {
      caller: this.procId,
      menu: menu,
      item: item,
    };

    for (let key in additional) {
      data[key] = additional[key];
    }

    ToolbarControl.getInstance().register(data, cb);
    return this;
  }
}
export class ToolbarControl {
  public static RegisterBuilder(procId: string): RegisterBuilder {
    return new RegisterBuilder(procId);
  }
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

        case "toolbar":
          if (params === "open") {
            procmgr.openToolbar();
          }
          if (params === "close") {
            procmgr.closeToolbar();
          }
          return;
        case "dock":
          if (params === "open") {
            procmgr.openDock();
          }
          if (params === "close") {
            procmgr.closeDock();
          }
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
    // console.log("callback:", callback);
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
    if (item.separator) {
      retval["borderBottom"] = `1px solid ${colors["2"]}`;
    }
    if (disabled) {
      // retval.color = colors["3"];
      retval["textDecoration"] = "line-through";
      retval.color = colors["2"] + "99";
      return retval;
    }
    if (hovered) {
      retval.color = colors["1"];
      retval.backgroundColor = colors["2"] + "aa";
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

  const front = ProcMgr.getInstance().front();
  useEffect(() => {
    setCollActive(false);
  }, [front]);

  const [posX, setPosX] = useState(undefined);
  const onTitleClick = (e) => {
    setPosX(`${e.target.getBoundingClientRect().x}px`);
    if (0) {
      props.menuActivate?.();
      setCollActive(true);
    } else {
      setCollActive(props.menuToggleActivate() !== null ? true : false);
    }
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

  let order = 0;
  const _items: TbItem[] = menu.items.map((item) => {
    const retval = { ...item };
    retval.order = retval.order ?? order++;
    return retval;
  });

  while (_items.find((item) => item.order === -1)) {
    _items.find((item) => item.order === -1).order = order++;
  }
  _items.sort((l, r) => l.order - r.order);

  if (_items.length > 0) {
    //ignore separator at the end
    _items[_items.length - 1].separator = false;
  }

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
        {_items.map((item, i) => (
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
  const procmgr = ProcMgr.getInstance();
  const [isEdge, setIsEdge] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(null);
  const openByMgr = procmgr.isToolbarOpen();
  const show: boolean = isEdge || hovered || clicked !== null;
  const className = show || openByMgr ? styles.active : "";
  const bgClassName = show && !openByMgr ? styles.active : "";
  const colors = SetMgr.getInstance().themeReadable(useAppSelector).colors;

  const front = ProcMgr.getInstance().front();
  const frontMenus: ToolbarItem[] = front?.["toolbar"];

  const _mouseEdgeDetect = () => {
    const toolbarTriggerHeight = 3;
    const dockTriggerHeight = 20;
    const detectEdge = (e) => {
      setIsEdge(Math.abs(e.clientY) < toolbarTriggerHeight);
    };
    window.addEventListener("mousemove", detectEdge);
    return () => {
      window.removeEventListener("mousemove", detectEdge);
    };
  };
  useEffect(_mouseEdgeDetect, []);

  const buildContainerStyle = () => {
    return {
      color: colors["2"],
      backgroundColor: colors["1"],
    };
  };
  const containerStyle = buildContainerStyle();

  const isToolbarOpen = procmgr.isToolbarOpen();
  const isDockOpen = procmgr.isDockOpen();

  const parseItems = (items: TbItem[]): TbProc => {
    //toggle toolbar
    {
      const tbIdx = systemMenu.indexOf(
        systemMenu.find((menu) => menu.item.includes("toolbar"))
      );
      systemMenu[tbIdx].item = isToolbarOpen ? "Hide toolbar" : "Fix toolbar";
      systemMenu[tbIdx].callback = isToolbarOpen
        ? "system.proc.toolbar.close"
        : "system.proc.toolbar.open";
    }

    //toggle dock
    {
      const dockIdx = systemMenu.indexOf(
        systemMenu.find((menu) => menu.item.includes("dock"))
      );
      systemMenu[dockIdx].item = isDockOpen ? "Hide dock" : "Fix dock";
      systemMenu[dockIdx].callback = isDockOpen
        ? "system.proc.dock.close"
        : "system.proc.dock.open";
    }

    const retval: TbMenu[] = [{ menu: "🍞", items: systemMenu }];
    if (!items || items.length === 0) {
      if (!front || !front.name) {
        return retval;
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
    // console.log("frontMenus update :", frontMenus);
    const _tbproc = parseItems(frontMenus);
    setMenus(_tbproc);
  }, [frontMenus, isToolbarOpen, isDockOpen]);

  const uncollapse = (e) => {
    setHovered(false);
    setClicked(null);
    window.removeEventListener("keydown", handleEscape);
    // procmgr.closeToolbar();
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
                menuToggleActivate={() => {
                  let val;
                  setClicked((num) => {
                    const retval = i === num ? null : i;
                    val = i;
                    return retval;
                  });
                  window.removeEventListener("keydown", handleEscape);
                  return val;
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
      <div className={`${styles.bg} ${bgClassName}`} onClick={uncollapse}></div>
    </>
  );
}
