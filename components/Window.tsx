import React from "react";
import { useEffect, useRef, useState } from "react";
import ReactDOM, { render } from "react-dom";
import { useDispatch } from "react-redux";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import FileMgr from "../features/file/FileMgr";
import Log from "../features/log/Log";
import ProcMgr from "../features/procmgr/ProcMgr";
import {
  killProc,
  selectProcProp,
  setActiveWindow,
  setProcProps,
  toggleMaximize,
} from "../features/procmgr/procSlice";
import Process, { Rect } from "../features/procmgr/ProcTypes";
import SetMgr from "../features/settings/SetMgr";
import officialThemes from "../features/settings/Themes";
import { addError } from "../scripts/Path";
import { clamp, randomId } from "../scripts/utils";
import styles from "../styles/Window.module.css";

const minHeight = 240;
const minWidth = 300;
let pos1 = 0,
  pos2 = 0,
  pos3 = 0,
  pos4 = 0;
let maximizeTransition = "0.3s";
function dragMouseDown(e: any) {
  const el = e.currentTarget.parentElement;
  if (!el) {
    addError("el eempty");
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

  let offsetTop = clamp(el.offsetTop - pos2, 0, window.innerHeight - minHeight);
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

  // {
  //   //for store update
  //   Updater.rect("top", winElem.style.top).rect("left", winElem.style.left);
  // }
  //restore transition
  // win.style.transition = transition;
  // contentElem.classList.remove("dragging");
}

export default function Window(props) {
  let _navElem = useRef(null);
  let winElem: HTMLElement | undefined;
  let navElem: HTMLElement | undefined;
  const winId: string = randomId();
  const navId: string = randomId();
  let effectCalled = 1;
  const setElems = () => {
    winElem = document.querySelector(`#${winId}`) as HTMLElement;
    navElem = document.querySelector(`#${navId}`) as HTMLElement;
  };

  const procmgr = ProcMgr.getInstance();
  const proc: Process = props.proc;
  const get = (prop) => procmgr.get(proc.id, prop);
  const rect: Rect = get("rect");
  // console.log(`Win rect of ${proc.comp}, rect :`, rect);
  const isMax = get("isMaximized");
  const isFront = procmgr.isFront(proc.id);

  useEffect(() => {
    // console.log("Use effect called :", effectCalled++);
    setElems();
    if (winElem) {
      dispatchRect();
      if (winElem && proc["resize"] === "both") {
        console.log("Resize in");
        resizeObserver.observe(winElem);
      } else {
        resizeObserver.disconnect();
      }
    }
    if (proc.name) {
      procmgr.set(proc.id, { name: proc.name });
    }
  }, []);

  ////////////////// detect resize
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      // console.log("Borderbox: ", entry.borderBoxSize.at(0));
      // console.log("ContentBoxSize: ", entry.contentBoxSize.at(0));
    }
  });

  ////////////////// rect / style / theme
  const themeReadable = SetMgr.getInstance().themeReadable(useAppSelector);
  // console.log("Cur theme name : ", themeReadable.name);
  const _colors = themeReadable.colors;
  const [navHovered, setNavHovered] = useState(false);
  const buildNavStyle = () => {
    return {
      color: _colors["2"],
      backgroundColor: _colors["1"],
    };
  };
  const buildStyle = (rect: Rect, id: string) => {
    const retval = { ...proc.rect };
    // console.log(`Buildstyle from id:${id}, rect : ${JSON.stringify(rect)}`);

    // min w/h
    {
      retval["minWidth"] = proc["minWidth"] ?? minWidth;
      retval["minHeight"] = proc["minHeight"] ?? minHeight;
    }

    //rect
    {
      if (!!rect) {
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
    console.log("minimizeBtn clicked from ", proc.name);
  };

  const contElemStyle = buildStyle(rect, proc.id);
  const navElemStyle = buildNavStyle();
  const closeBtnStyle = { backgroundColor: _colors["error"] };
  const minBtnStyle = { backgroundColor: _colors["warn"] };
  const maxBtnStyle = { backgroundColor: _colors["okay"] };

  const togglegrabbable = () => {
    //watches before transition, so toggle opposite way
    if (isMax) {
      _navElem?.current.classList.add(styles.grabbable);
    } else {
      _navElem?.current.classList.remove(styles.grabbable);
    }
  };

  const toggleWindowMaximize = (e) => {
    if (!winElem) {
      setElems();
    }
    if (winElem) {
      console.log("Maximize transition : ", maximizeTransition);
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
    procmgr.toggleMaximize(proc.id);
    procmgr;
    // dispatch(toggleMaximize(proc.id));
    // setTimeout(togglegrabbable, 500);
    togglegrabbable();
  };

  const onContainerMouseDown = (e) => {
    let cl = (e.target as HTMLElement).classList;
    {
      //handle switches
      if (cl.contains("btn-close")) {
        onCloseBtn();
        return;
      }
      if (cl.contains("btn-minimize")) {
        onMinimizeBtn(e);
        return;
      }
      if (cl.contains("btn-maximize")) {
        toggleWindowMaximize(e);
        return;
      }
    }

    if (!winElem) {
      setElems();
    }

    // dispatch(setActiveWindow(proc.id));
    procmgr.setFront(proc.id);
    console.log("On mouse down");
  };

  return (
    <section
      className={`${styles["window-container"]}`}
      id={winId}
      onMouseDown={onContainerMouseDown}
      style={contElemStyle}
      onMouseUp={(e) => {
        console.log("On mouse up");
      }}
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
          style={{ backgroundColor: navHovered ? _colors["2"] : "transparent" }}
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
            className={`${styles["btn-close"]} btn-close`}
            // onClick={onCloseBtn}
            style={closeBtnStyle}
          />
          <li
            className={`${styles["btn-minimize"]} btn-minimize`}
            style={minBtnStyle}
            // onClick={onMinimizeBtn}
          />
          <li
            className={`${styles["btn-maximize"]} btn-maximize`}
            // onClick={toggleWindowMaximize}
            style={maxBtnStyle}
          />
        </ul>
        <span className={styles["window-title"]}>
          {proc.name ?? "Application"}
        </span>
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
  );
}
