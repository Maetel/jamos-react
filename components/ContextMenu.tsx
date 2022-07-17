import CallbackStore from "../features/JamOS/CallbackStore";
import Process from "../features/procmgr/ProcTypes";
import Window from "./Window";
import styles from "../styles/ContextMenu.module.css";
import { useEffect } from "react";
import JamOS from "../features/JamOS/JamOS";
import useEffectOnce from "../scripts/useEffectOnce";

export interface CtxMenuProps {
  pageX: number;
  pageY: number;
  items: string[];
  callbackIds: string[];
  //seperator: "__separator__";
  //when found among items, a separator(s) will be added right in place.
}

export default function ContextMenu(props) {
  const proc: Process = { ...props.proc };
  const menus: CtxMenuProps = proc.ctxMenuProps;
  proc.disableBackground = true;
  proc.opaqueBackground = false;
  proc.closeOnBackgroundClick = true;
  proc.hideNav = true;
  proc.hideNavButtons = true;
  proc.disableDrag = true;
  useEffect(() => {
    CallbackStore.getById(proc.onMount)?.();
    return () => {
      CallbackStore.getById(proc.onDestroy)?.();
    };
  }, []);
  const buildRect = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = menus.pageX;
    const y = menus.pageY;

    //direction
    const openRight: boolean = x / w < 0.5;
    const openDown: boolean = y / h < 0.5;

    const paddingVertical = 10;
    const itemHeight = 30;
    const separatorHeight = 10;
    const menuW = 280;
    const menuH =
      paddingVertical +
      menus.items
        .map((item) =>
          item === "__separator__" ? separatorHeight : itemHeight
        )
        .reduce((prev, next) => prev + next, 0);

    const retval = {
      top: menus.pageY - (openDown ? 0 : menuH),
      left: menus.pageX - (openRight ? 0 : menuW),
      width: menuW,
      height: menuH,
      minWidth: menuW,
      minHeight: menuH,
    };
    return retval;
  };
  proc.rect = buildRect();

  const colors = JamOS.theme.colors;
  const hovered = JamOS.procmgr.getReadable(proc.id, "hovered");
  const setHovered = (i: number) => {
    JamOS.procmgr.set(proc.id, { hovered: i });
  };

  const killThis = () => {
    JamOS.procmgr.kill(proc.id);
  };
  const handleKey = (e) => {
    if (e.key === "Escape") {
      killThis();
    }
  };
  const ignoreRightClick = (e) => {
    e.preventDefault();
  };
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    window.addEventListener("contextmenu", ignoreRightClick);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("contextmenu", ignoreRightClick);
    };
  }, []);
  useEffectOnce(() => {
    return () => {
      CallbackStore.unregisterIDs(menus.callbackIds);
    };
  });

  const buildMenuColor = () => {
    return {
      color: colors["1"],
      backgroundColor: "transparent", //`${colors["2"]}11`,
    };
  };
  const menuStyle = buildMenuColor();

  return (
    <Window {...props} proc={proc}>
      <ul className={styles.items} style={menuStyle}>
        {menus.items.map((item, i) => {
          if (item === "__separator__") {
            return (
              <li
                className={styles.separator}
                key={i}
                style={{ borderBottom: `1px solid ${colors["1"]}` }}
              ></li>
            );
          }
          return (
            <li
              className={styles.item}
              key={i}
              onMouseEnter={() => {
                setHovered(i);
              }}
              onMouseLeave={(e) => {
                setHovered(null);
              }}
              onClick={(e) => {
                //exclude separator and re-calc index
                const cbIdx = menus.items
                  .filter((_item) => _item !== "__separator__")
                  .findIndex((_item) => _item === item);
                CallbackStore.getById(menus.callbackIds.at(cbIdx))?.(item);
                killThis();
              }}
              style={{
                color: hovered === i ? colors["2"] : colors["1"],
                backgroundColor: `${
                  hovered === i ? colors["1"] : "transparent"
                }`,
              }}
            >
              {item}
            </li>
          );
        })}
      </ul>
    </Window>
  );
}
