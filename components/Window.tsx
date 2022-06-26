import React from "react";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../app/hooks";
import FileMgr from "../features/file/FileMgr";
import Log from "../features/log/Log";
import ProcMgr from "../features/procmgr/ProcMgr";

import Process, { Rect } from "../features/procmgr/ProcTypes";
import SetMgr from "../features/settings/SetMgr";
import { ThemeColors } from "../features/settings/Themes";
import { ToolbarControl } from "../grounds/Toolbar";
import { ToolbarItem } from "../scripts/ToolbarTypes";
import { clamp, randomId } from "../scripts/utils";
import styles from "../styles/Window.module.css";
import Dialogue from "./Dialogue";

const minHeight = 240;
const minWidth = 300;
let pos1 = 0,
  pos2 = 0,
  pos3 = 0,
  pos4 = 0;
let maximizeTransition = "0.3s";

interface DialogueProps {
  type: string; // 'buttons' | '
  cancel: () => void;
  rect?: Rect;
  title?: string;
  descs?: string[];
  elem?: JSX.Element;
  buttons?: string[];
  callbacks?: ((params) => boolean)[];
}

function DialogueWindow(props) {
  const dial: DialogueProps = props.dial;
  const rect = dial.rect ?? {
    top: "25%",
    left: "25%",
    width: "50%",
    height: "50%",
  };
  // const colors = SetMgr.getInstance().themeReadable(useAppSelector).colors;
  const colors: ThemeColors = SetMgr.colors();

  const [style, setStyle] = useState((dial?.rect ?? rect) as {});

  const handleKey = (e) => {
    if (!dial.callbacks && dial.callbacks.length > 0) {
      return;
    }
    // e.preventDefault();
    switch (e.key) {
      case "Escape":
        console.log("Dialogue escape");
        dial.cancel();
        // dial.callbacks.at(dial.callbacks.length - 1);
        break;
      case "Enter":
        dial.callbacks.at(0);
        console.log("Dialogue enter");
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [dial]);
  useEffect(() => {
    const buildStyle = () => {
      const initialRect = dial?.rect ?? rect;
      let retval: {} = { ...initialRect };
      retval["color"] = colors["1"];
      retval["backgroundColor"] = colors["2"];
      retval["boxShadow"] = colors.boxShadow;
      return retval;
    };
    const st = buildStyle();
    // setStyle(() => st);
  }, [colors, rect]);
  return dial ? (
    <div className={styles.dialogueWindow} style={style}>
      <div
        className={styles.dialNav}
        style={{ backgroundColor: colors["1"], color: colors["2"] }}
      >
        <button
          className={styles.dialCloseBtn}
          style={{ backgroundColor: colors.error }}
        ></button>
      </div>
    </div>
  ) : undefined;
}

export default function Window(props) {
  let _winElem = useRef(null);
  let _navElem = useRef(null);
  let winElem: HTMLElement | undefined;
  let navElem: HTMLElement | undefined;
  const winId: string = randomId();
  const navId: string = randomId();
  const setElems = () => {
    winElem = document.querySelector(`#${winId}`) as HTMLElement;
    navElem = document.querySelector(`#${navId}`) as HTMLElement;
  };

  const procmgr = ProcMgr.getInstance();
  const proc: Process = { ...props.proc };
  // proc["disableMinBtn"] = true;
  const btnMaxClass = proc["disableMaxBtn"] ? styles.disabled : "";
  const btnMinClass = proc["disableMinBtn"] ? styles.disabled : "";
  const btnCloseClass = proc["disableCloseBtn"] ? styles.disabled : "";

  proc.name = proc.name ?? "Application";
  const get = (prop) => procmgr.getReadable(useAppSelector, proc.id, prop);
  // const get = (prop) => procmgr.get(proc.id, prop);

  ////////////////// rect / style / theme
  const themeReadable = SetMgr.getInstance().themeReadable(useAppSelector);
  const _colors = themeReadable.colors;
  const buildStyle = (rect: Rect) => {
    const retval = {};
    // console.log(`Buildstyle from id:${id}, rect : ${JSON.stringify(rect)}`);

    //handle minimized
    if (isMin) {
      retval["display"] = "none";
    } else {
      retval["display"] = "block";
    }

    // min w/h
    {
      retval["minWidth"] = proc["minWidth"] ?? minWidth;
      retval["minHeight"] = proc["minHeight"] ?? minHeight;
    }

    //rect
    {
      if (rect) {
        for (let key in rect) {
          retval[key] = rect[key];
        }
      }
      const calcInitLeft = (count: number) => {
        return `${3 + Math.floor(count / 20) + (count % 20) * 2}%`;
      };
      const calcInitTop = (count: number) => {
        return `${5 + 3 * Math.floor(count / 20) + (count % 20) * 2}%`;
      };
      if (!(retval["top"] || retval["bottom"])) {
        retval["top"] = calcInitTop(parseInt(proc.id));
      }
      if (!(retval["left"] || retval["right"])) {
        retval["left"] = calcInitLeft(parseInt(proc.id));
      }

      retval["width"] = retval["width"] ?? proc.rect?.["width"] ?? "50%";
      if (!(retval["height"] || retval["aspectRatio"])) {
        if (proc["rect"]?.["aspectRatio"]) {
          retval["aspectRatio"] = proc["rect"]["aspectRatio"];
        }
        if (proc["rect"]?.["height"]) {
          retval["height"] = proc["rect"]["height"];
        }
        if (!(retval["height"] || retval["aspectRatio"])) {
          retval["height"] = "70%";
        }
      }
    }

    //theme
    {
      retval["color"] = _colors["1"];
      retval["backgroundColor"] = _colors["2"];
      retval["boxShadow"] = _colors["boxShadow"];
    }

    //bar
    {
      retval["borderRadius"] = isMax ? 0 : 8;
    }

    //resize
    {
      if (!isMax && isFront) {
        retval["resize"] = proc["resize"] ?? "none";
      }
    }

    // console.log("Buildstyle : ", retval);
    return retval;
  };
  const [contElemStyle, setContElemStyle] = useState(null);
  useEffect(() => {
    // console.log("New rect called");
    // console.log("Initial rect : ", proc.rect);
    const _setContElemStyle = () => {
      const style = buildStyle(proc.rect);
      const nuRect = {};
      for (let key in style) {
        const _l = [
          "top",
          "left",
          "bottom",
          "right",
          "width",
          "height",
          "aspectRatio",
        ];
        if (_l.includes(key)) {
          nuRect[key] = style[key];
        }
      }
      // console.log("New rect : ", nuRect);
      procmgr.set(proc.id, { rect: nuRect });
      return style;
    };
    const _contElemStyle = _setContElemStyle();
    setContElemStyle(_contElemStyle);

    // console.log("Currect style :", curRect());
    setElems();
    // if (proc.name) {
    //   procmgr.set(proc.id, { name: proc.name });
    // }
    procmgr.set(proc.id, { name: proc.name ?? "Application" });
  }, []);
  const rectReadable: Rect = get("rect");
  // console.log("rectReadable:", rectReadable);

  //////////////////////////////////// register Toolbar.quit()
  /*
        'Cannot update a component (`Toolbar`) while rendering a different component (`Toolbar`). To locate the bad setState() call inside `Toolbar`'
        */
  const register = (menu, item, cb, seperator?: boolean) => {
    const data: ToolbarItem = {
      caller: proc.id,
      menu: menu,
      item: item,
      order: -1, //last
    };
    if (seperator) {
      data.separator = seperator;
    }
    ToolbarControl.getInstance().register(data, cb);
  };
  useEffect(() => {
    // console.log("call");
    register(
      proc.name,
      `Quit ${proc.name}`,
      () => {
        procmgr.kill(proc.id);
        // addHelp();
      },
      true
    );
  }, []);

  const closeDial = () => {
    setDial(null);
  };
  //////////////////////////////////// dialogue
  const initialDial: DialogueProps = {
    type: "buttons",
    cancel: closeDial,
    title: "Dialogue",
    descs: ["desc1", "desc2"],
    buttons: ["Okay", "cancel"],
    callbacks: [
      (params) => {
        console.log("Okay");
        return true;
      },
      (params) => {
        console.log("Cancel");
        return false;
      },
    ],
  };
  const [dial, setDial] = useState({ ...initialDial });

  //////////////////////////////////// drag events
  function dragMouseDown(e: any) {
    // const el = e.currentTarget.parentElement;
    const el = _winElem.current;
    if (!el) {
      Log.error("el eempty");
      return;
    }
    if ((e.target as HTMLElement).classList.contains(styles.btn)) {
      return;
    }
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    el.style.transition = "0s";
    // contentElem.classList.add("dragging");
    document.onmouseup = () => {
      closeDragElement(el);
    };
    // call a function whenever the cursor moves:
    document.onmousemove = (_e) => {
      elementDrag(_e, el);
    };
  }

  function elementDrag(e: any, el: HTMLElement) {
    e = e || window.event;
    e.preventDefault();

    //remove window transition

    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // set the element's new position and bound:

    let offsetTop = clamp(
      el.offsetTop - pos2,
      0,
      window.innerHeight - minHeight
    );
    let offsetLeft = clamp(
      el.offsetLeft - pos1,
      minWidth - parseInt(getComputedStyle(el).width.replace("px", "")),
      window.innerWidth - minWidth
    );
    el.style.top = `${offsetTop}px`;
    el.style.left = `${offsetLeft}px`;
    // Updater.rect("top", `${offsetTop}px`);
    // Updater.rect("left", `${offsetLeft}px`);
  }

  function closeDragElement(el: HTMLElement) {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
    dispatchRect();
  }

  // console.log(`Win rect of ${proc.comp}, rect :`, rect);
  const isMax = get("isMaximized");
  const isMin = get("isMinimized");
  const isFront = procmgr.isFront(proc.id);

  useEffect(() => {
    if (!rectReadable) {
      return;
    }
    setContElemStyle(() => buildStyle(rectReadable));
  }, [rectReadable, _colors, isMax, isMin, isFront]);

  ////////////////// detect resize
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      // console.log("Borderbox: ", entry.borderBoxSize.at(0));
      // console.log("ContentBoxSize: ", entry.contentBoxSize.at(0));
    }
  });

  const [navHovered, setNavHovered] = useState(false);
  const buildNavStyle = () => {
    return {
      color: _colors["2"],
      backgroundColor: _colors["1"],
    };
  };
  const buildMaxBtnStyle = () => {
    const retval = { backgroundColor: _colors["okay"] };
    if (proc.disableMaxBtn) {
      // retval["disabled"] = true;
    }
    return retval;
  };

  const curRect = () => {
    if (!winElem) {
      setElems();
    }
    const s = getComputedStyle(winElem);
    const retval: Rect = {
      top: s.top,
      left: s.left,
      width: s.width,
      height: s.height,
    };
    return retval;
  };
  const dispatchRect = () => {
    const _rect = curRect();
    procmgr.set(proc.id, { rect: _rect });
    return _rect;
  };

  const dispatchCloseWindow = () => {
    Log.log(`Kill proc:` + proc.id);
    procmgr.kill(proc.id);
    // dispatch(killProc(proc.id));
  };
  const onCloseBtn = dispatchCloseWindow;
  const onMinimizeBtn = (e) => {
    // console.log("minimizeBtn clicked from ", proc.name);
    procmgr.minimize(proc.id);
  };

  const navElemStyle = buildNavStyle();
  const closeBtnStyle = { backgroundColor: _colors["error"] };
  const minBtnStyle = { backgroundColor: _colors["warn"] };
  const maxBtnStyle = buildMaxBtnStyle();

  const togglegrabbable = () => {
    //watches before transition, so toggle opposite way
    if (isMax) {
      _navElem?.current.classList.add(styles.grabbable);
    } else {
      _navElem?.current.classList.remove(styles.grabbable);
    }
  };

  // set window transition then toggle maximize
  const toggleWindowMaximize = (e) => {
    if (!winElem) {
      setElems();
    }
    if (winElem) {
      // console.log("Maximize transition : ", maximizeTransition);
      winElem.style.setProperty("transition", maximizeTransition);
      const safetimeout =
        parseInt(maximizeTransition.toLowerCase().replace("s", "")) * 1000 +
        100;
      setTimeout(() => {
        if (winElem) {
          //in case winelem is destroyed before setproperty
          winElem.style.setProperty("transition", "0s");
        }
      }, safetimeout);
    }
    console.log("toggleWindowMaximize");
    procmgr.toggleMaximize(proc.id);
    togglegrabbable();
  };

  const onContainerMouseDown = (e) => {
    let cl = (e.target as HTMLElement).classList;
    {
      //handle switches
      if (cl.contains(styles["btn-close"]) && !proc["disableCloseBtn"]) {
        onCloseBtn();
        return;
      }
      if (cl.contains(styles["btn-minimize"]) && !proc["disableMinBtn"]) {
        onMinimizeBtn(e);
        return;
      }
      if (cl.contains(styles["btn-maximize"]) && !proc["disableMaxBtn"]) {
        procmgr.setFront(proc.id);
        // dispatchRect();
        setTimeout((e) => {
          toggleWindowMaximize(e);
          proc.onFocus?.();
        }, 1);
        return;
      }
    }

    if (!winElem) {
      setElems();
    }

    // dispatch(setActiveWindow(proc.id));
    // dispatchRect();
    procmgr.setFront(proc.id);
    // console.log("On mouse down");
  };

  return (
    <>
      <section
        className={`${styles["window-container"]}`}
        id={winId}
        onMouseDown={onContainerMouseDown}
        style={contElemStyle}
        onMouseUp={(e) => {
          // console.log("On mouse up");
        }}
        ref={_winElem}
      >
        <div
          className={`${styles["window-container-header"]} ${styles.grabbable}`}
          id={navId}
          ref={_navElem}
          onMouseDown={(e) => {
            if (!isMax) {
              dragMouseDown(e);
            }
          }}
          style={navElemStyle}
        >
          <ul
            className={styles["button-container"]}
            style={{
              backgroundColor: navHovered ? _colors["2"] : "transparent",
            }}
            onMouseEnter={(e) => {
              // navElemStyle["backgroundColor"] = _colors["3"];
              setNavHovered(true);
            }}
            onMouseLeave={(e) => {
              setNavHovered(false);
              // navElemStyle["backgroundColor"] = "transparent";
            }}
          >
            <li
              className={`${styles["btn-close"]} ${styles["btn"]} ${btnCloseClass}`}
              // onClick={onCloseBtn}
              style={closeBtnStyle}
            />
            <li
              className={`${styles["btn-minimize"]} ${styles["btn"]} ${btnMinClass}`}
              style={minBtnStyle}
              // onClick={onMinimizeBtn}
            />
            <li
              className={`${styles["btn-maximize"]} ${styles["btn"]} ${btnMaxClass}`}
              // onClick={toggleWindowMaximize}
              style={maxBtnStyle}
            />
          </ul>
          <span className={styles["window-title"]}>{proc.name}</span>
        </div>
        <div
          className={styles["content-container"]}
          onClick={(e) => {
            proc.onFocus?.();
          }}
        >
          {(props as any).children}
        </div>
      </section>
      {/* {dial ? <Window {...dial}></Window> : undefined} */}
    </>
  );
}
