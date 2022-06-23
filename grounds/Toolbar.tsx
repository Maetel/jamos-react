import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../app/hooks";
import Log from "../features/log/Log";
import ProcMgr from "../features/procmgr/ProcMgr";
import SetMgr from "../features/settings/SetMgr";
import { CollapsibleItem, CollapsibleMenu } from "../scripts/ToolbarTypes";

import styles from "../styles/Toolbar.module.css";

const systemMenu: CollapsibleMenu = {
  caller: "system",
  menu: "🍞",
  items: [
    {
      item: "About JamOS",
      callback: "system.proc.add.about",
      separator: true,
    },
    { item: "Settings", callback: "system.proc.add.settings" },
    { item: "System Monitor", callback: "system.proc.add.systeminfo" },
    {
      item: "AppStore",
      callback: "system.proc.add.appstore",
      separator: true,
    },
    {
      item: "Terminal",
      callback: "system.proc.add.terminal",
      separator: true,
    },
    ,
    { item: "Close all windows", callback: "system.proc.killall.system" },
  ],
};

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
  private _merge(caller, menu, item) {
    return `${caller}/${menu}/${item}`;
  }
  public registerMenu(collMenu: CollapsibleMenu, callbacks: (() => void)[]) {
    if (collMenu.items.length !== callbacks.length) {
      throw new Error(
        `Toolbar register error. Must be 'menu.items.length === callbacks.length', which was '${collMenu.items.length} !== ${callbacks.length}'`
      );
    }
    const { caller, menu, items } = collMenu;

    items.forEach((item, i) => {
      ToolbarControl.callbacks[this._merge(caller, menu, item.item)] =
        callbacks.at(i);
    });
    for (let i = 0; i < collMenu.items.length; ++i) {
      collMenu.items.at(i).callback =
        collMenu.items.at(i).callback ??
        this._merge(caller, menu, collMenu.items.at(i).item);
    }

    const procmgr = ProcMgr.getInstance();
    let menus: CollapsibleMenu[] =
      procmgr.get(
        // selector,
        caller,
        "toolbar"
      ) ?? [];
    const menuFound = menus.find((_menu) => _menu.menu === menu);
    if (menuFound) {
      collMenu.items.forEach((item) => {
        //filter if already exists
        menuFound.items = [
          ...menuFound.items.filter((_items) => _items.item !== item.item),
          item,
        ];
      });

      menus = [...menus.filter((_menu) => _menu.menu !== menu), menuFound];
    } else {
      menus = [...menus, collMenu];
    }
    procmgr.set(caller, { toolbar: menus });
    console.log("Registered menus : ", menus);
  }
  public unregister(procId: string) {
    if (ToolbarControl.callbacks[procId]) {
      for (let key in ToolbarControl.callbacks[procId]) {
        delete ToolbarControl.callbacks[procId][key];
      }
      delete ToolbarControl.callbacks[procId];
    }
  }
  public execute(callback: string) {
    console.log("callback:", callback);
    if (callback.startsWith("system")) {
      this._systemCallbackParser(callback);
      return;
    }
    ToolbarControl.callbacks[callback]?.();
    if (!ToolbarControl.callbacks[callback]) {
      Log.error(
        `Toolbar callback does not exist for : ${JSON.stringify(callback)}`
      );
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
        // ProcMgr.getInstance().front()?.[item.callback]?.();
        // ToolbarControl.getInstance().execute("system", item.menu, item.item);
        ToolbarControl.getInstance().execute(item.callback);
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
    setPosX(`${e.target.getBoundingClientRect().x}px`);
    props.menuActivate?.();
    setCollActive(true);
  };

  const items: CollapsibleItem[] =
    menu.items ??
    [
      // { menu: "No item", item: "No item", disabled: true },
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
        className={`${styles.collMenu}`}
        onClick={onTitleClick}
        ref={collMenuElem}
        style={titleStyle}
      >
        {menu.menu}
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

  const front = ProcMgr.getInstance().front();
  const frontMenus: CollapsibleMenu[] = front?.["toolbar"];

  // console.log("FrontMenus:", frontMenus);

  const buildContainerStyle = () => {
    return {
      color: colors["2"],
      backgroundColor: colors["1"],
    };
  };
  const containerStyle = buildContainerStyle();

  const procmgr = ProcMgr.getInstance();
  let initialColl = [systemMenu];
  const buildColls = () => {
    // console.log("Build colls called :", frontMenus);
    if (frontMenus) {
      return [systemMenu, ...frontMenus];
    }
    return [systemMenu];
  };
  useEffect(() => {
    updateFront();
    // setCollapsibles(buildColls());
  }, [frontMenus]);
  const updateFront = () => {
    setCollapsibles(buildColls());
  };
  const [collapsibles, setCollapsibles] = useState([systemMenu]);

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
          updateFront();
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
