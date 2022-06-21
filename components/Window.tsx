import React from "react";
import { useEffect, useRef, useState } from "react";
import ReactDOM, { render } from "react-dom";
import { useDispatch } from "react-redux";
import { useAppDispatch, useAppSelector } from "../app/hooks";
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

let pos1 = 0,
  pos2 = 0,
  pos3 = 0,
  pos4 = 0;
let defaultTransition = "0.3s";
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
  const minHeight = 150;
  const minWidth = 180;
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
  el.style.transition = defaultTransition;
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
  useEffect(() => {
    // console.log("Use effect called :", effectCalled++);
    setElems();
    if (winElem) {
      dispatchRect();
    }
  }, []);

  const dispatch = useAppDispatch();
  const proc: Process = props.proc;
  const rect: Rect = useAppSelector(selectProcProp(proc.id, "rect"));
  console.log(`Win rect of ${proc.comp}, rect :`, rect);
  const isMax = useAppSelector(selectProcProp(proc.id, "isMaximized"));

  ////////////////// rect / style / theme
  const [transition, setTransition] = useState("0.3s");
  const themeReadable = SetMgr.getInstance().themeReadable(useAppSelector);
  // console.log("Cur theme name : ", themeReadable.name);
  const _colors = themeReadable.colors;
  const buildNavStyle = () => {
    return {
      color: _colors["2"],
      backgroundColor: _colors["1"],
    };
  };
  const buildStyle = (rect: Rect, id: string) => {
    const retval = {};
    // console.log(`Buildstyle from id:${id}, rect : ${JSON.stringify(rect)}`);

    //rect
    if (rect?.["width"] === "100%" && proc.comp === "systeminfo") {
      // debugger;
    }
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
    const payload = {
      id: proc.id,
      props: {
        rect: _rect,
      },
    };

    dispatch(setProcProps(payload));

    return _rect;
  };

  const dispatchCloseWindow = () => {
    Log.log(`Kill proc:` + proc.id);
    dispatch(killProc(proc.id));
  };
  const onCloseBtn = dispatchCloseWindow;

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
    dispatch(toggleMaximize(proc.id));
    // setTimeout(togglegrabbable, 500);
    togglegrabbable();
  };

  return (
    <section
      className={`${styles["window-container"]}`}
      id={winId}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).classList.contains("btn-close")) {
          onCloseBtn();
          return;
        }
        dispatch(setActiveWindow(proc.id));
      }}
      style={contElemStyle}
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
        onMouseUp={(e) => {
          dispatchRect();
        }}
        style={navElemStyle}
      >
        <ul className={styles["button-container"]}>
          <li
            className={`${styles["btn-close"]} btn-close`}
            onClick={onCloseBtn}
            style={closeBtnStyle}
          />
          <li className={styles["btn-minimize"]} style={minBtnStyle} />
          <li
            className={styles["btn-maximize"]}
            onClick={toggleWindowMaximize}
            style={maxBtnStyle}
          />
        </ul>
        <span className={styles["window-title"]}>
          {proc.name ?? "Application"}
        </span>
      </div>
      <div className={styles["content-container"]}>
        {(props as any).children}
      </div>
    </section>
  );
}
