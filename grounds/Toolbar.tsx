import { useEffect, useRef, useState } from "react";
import CallbackStore from "../features/JamOS/CallbackStore";
import JamOS from "../features/JamOS/JamOS";
import { JamUser } from "../features/JamOS/osSlice";
import Log from "../features/log/Log";
import { ToolbarItem, ToolbarItemId } from "../scripts/ToolbarTypes";

import styles from "../styles/Toolbar.module.css";

type TbItem = ToolbarItem;
type TbMenu = { menu: string; items: TbItem[] };
type TbProc = TbMenu[];

//watch CallbackStore.systemCallbackBuilder
const systemMenu: ToolbarItem[] = [
  {
    caller: "system",
    menu: "🍞",
    item: "About JamOS",
    callback: "system/Toolbar/add/about",
  },
  {
    caller: "system",
    menu: "🍞",
    item: "Sign in",
    callback: "system/Toolbar/add/jamhub",
    separator: true,
  },
  {
    caller: "system",
    menu: "🍞",
    item: "Settings",
    callback: "system/Toolbar/add/settings",
  },
  {
    caller: "system",
    menu: "🍞",
    item: "System Monitor",
    callback: "system/Toolbar/add/systeminfo",
  },
  {
    caller: "system",
    menu: "🍞",
    item: "Save world",
    callback: "system/Toolbar/save/world",
  },
  {
    caller: "system",
    menu: "🍞",
    item: "Load world",
    callback: "system/Toolbar/load/world",
    separator: true,
  },
  {
    caller: "system",
    menu: "🍞",
    item: "Fix toolbar",
    callback: "system/Toolbar/toolbar/open",
  },
  {
    caller: "system",
    menu: "🍞",
    item: "Fix dock",
    callback: "system/Toolbar/dock/open",
    separator: true,
  },
  {
    caller: "system",
    menu: "🍞",
    item: "AppStore",
    callback: "system/Toolbar/add/appstore",
  },
  {
    caller: "system",
    menu: "🍞",
    item: "Terminal",
    callback: "system/Toolbar/add/terminal",
    separator: true,
  },

  {
    caller: "system",
    menu: "🍞",
    item: "Close all windows",
    callback: "system/Toolbar/killall/system",
  },
];

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
  const colors = JamOS.theme.colors;
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
        CallbackStore.getById(item.callback)?.();
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
  const colors = JamOS.theme.colors;
  const collMenuElem = useRef(null);
  const [collActive, setCollActive] = useState(false);
  // const collActive = JamOS.procmgr.getReadable(
  //   "system",
  //   `toolbar/${menu.menu}`
  // );
  // const setCollActive = (val: boolean) => {
  //   const obj = {};
  //   obj[`toolbar/${menu.menu}`] = val;
  //   JamOS.procmgr.set("system", obj);
  // };
  const isActive = collActive && props.clicked === props.id;
  const itemClassName = isActive ? styles.active : "";

  const front = JamOS.procmgr.front();
  // const front = JamOS.procmgr.frontsParent();
  useEffect(() => {
    setCollActive(false);
    // console.log("front toolbar, ", front);
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
    const retval = {
      color: colors[isActive ? "1" : "2"],
      // backgroundColor: `${colors[isActive ? "2" : "1"]}aa`,
      backgroundColor: "transparent",
    };
    if (isActive) {
      retval.backgroundColor = colors["2"];
    }
    // console.log("Build title style. retval:", retval);
    return retval;
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
  const procmgr = JamOS.procmgr;
  const [isEdge, setIsEdge] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(null);
  const fixed = JamOS.isToolbarFixed();
  const forceOpen = JamOS.isToolbarOpenForced();
  const forceHidden = JamOS.isToolbarHiddenForced();
  const isOpen = (forceOpen || fixed) && !forceHidden;
  // console.log(
  //   `forceOpen:${forceOpen} forceHidden:${forceHidden} isOpen:${isOpen}`
  // );
  const show: () => boolean = () => isEdge || hovered || clicked !== null;
  const toolbarActive = () => (show() || isOpen ? styles.active : "");
  const toolbarBgActive = () =>
    (show() && !isOpen) || clicked !== null ? styles.active : "";
  const colors = JamOS.theme.colors;

  const front = JamOS.procmgr.front();
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

  const isToolbarFixed = JamOS.isToolbarFixed();
  const isDockFixed = JamOS.isDockFixed();

  const parseItems = (items: TbItem[]): TbProc => {
    //toggle toolbar
    {
      const tbIdx = systemMenu.indexOf(
        systemMenu.find((menu) => menu.callback.includes("jamhub"))
      );
      systemMenu[tbIdx].item = jamUser.signedin ? "JamHub" : "Sign in";
    }

    //toggle toolbar
    {
      const tbIdx = systemMenu.indexOf(
        systemMenu.find((menu) => menu.item.includes("toolbar"))
      );
      systemMenu[tbIdx].item = isToolbarFixed ? "Hide toolbar" : "Fix toolbar";
      systemMenu[tbIdx].callback = isToolbarFixed
        ? "system.proc.toolbar.close"
        : "system.proc.toolbar.fix";
    }

    //toggle dock
    {
      const dockIdx = systemMenu.indexOf(
        systemMenu.find((menu) => menu.item.includes("dock"))
      );
      systemMenu[dockIdx].item = isDockFixed ? "Hide dock" : "Fix dock";
      systemMenu[dockIdx].callback = isDockFixed
        ? "system.proc.dock.close"
        : "system.proc.dock.fix";
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
  // let tbproc: TbProc = [{ menu: "🍞", items: [...systemMenu] }];
  const [menus, setMenus] = useState([{ menu: "🍞", items: [...systemMenu] }]);
  const jamUser: JamUser = JamOS.userReadable();
  useEffect(() => {
    // console.log("frontMenus update :", frontMenus);
    const _tbproc = parseItems(frontMenus);
    setMenus(_tbproc);
  }, [frontMenus, isToolbarFixed, isDockFixed, jamUser]);

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
        className={`${styles.container} ${toolbarActive()}`}
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
      <div
        className={`${styles.bg} ${toolbarBgActive()}`}
        onClick={uncollapse}
      ></div>
    </>
  );
}
