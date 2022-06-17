import React from "react";
import { useEffect, useRef, useState } from "react";
import ReactDOM, { render } from "react-dom";
import { useDispatch } from "react-redux";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import ProcMgr from "../features/procmgr/ProcMgr";
import {
  selectProcProp,
  setActiveWindow,
  setProcProps,
} from "../features/procmgr/procSlice";
import Process, { Rect } from "../features/procmgr/ProcTypes";
import { addError } from "../scripts/Path";
import { clamp, randomId } from "../scripts/utils";
import styles from "../styles/Window.module.css";

const procmgr = ProcMgr.getInstance();

const onCloseBtn = (e) => {};
const onMaximizeBtn = (e: any) => {};

let pos1 = 0,
  pos2 = 0,
  pos3 = 0,
  pos4 = 0;

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
  if (!el) {
    return;
  }

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

  if (!el) {
    return;
  }

  // {
  //   //for store update
  //   Updater.rect("top", winElem.style.top).rect("left", winElem.style.left);
  // }
  //restore transition
  // winElem.style.transition = maximizeTransition;
  // win.style.transition = transition;
  // contentElem.classList.remove("dragging");
}

let winElem: HTMLElement | undefined;
let navElem: HTMLElement | undefined;
const winId: string = randomId();
const navId: string = randomId();

export default function Window(props) {
  const dispatch = useAppDispatch();
  const proc: Process = props.proc;
  const rect: Rect = useAppSelector(selectProcProp(proc.id, "rect"));

  const buildStyle = (rect: Rect, id: string) => {
    const retval = {};
    // console.log(`Buildstyle from id:${id}, rect : ${JSON.stringify(rect)}`);
    for (let key in rect) {
      retval[key] = rect[key];
    }
    return retval;
  };
  const dispatchRect = () => {
    const s = getComputedStyle(winElem);
    const retval: Rect = {
      top: s.top,
      left: s.left,
      width: s.width,
      height: s.height,
    };
    dispatch(
      setProcProps({
        id: proc.id,
        props: {
          rect: retval,
        },
      })
    );

    console.log("dispatchRect :", retval);
    return retval;
  };
  const style = buildStyle(rect, proc.id);

  let effectCalled = 1;
  useEffect(() => {
    console.log("Use effect called :", effectCalled++);
    winElem = document.querySelector(`#${winId}`) as HTMLElement;
    navElem = document.querySelector(`#${navId}`) as HTMLElement;
    if (winElem) {
      // dispatchRect();
    }
  }, []);

  // console.log(ReactDOM.findDOMNode(this.refs.container));

  return (
    <section
      className={styles["window-container"]}
      id={winId}
      onMouseDown={(e) => {
        dispatch(setActiveWindow(proc.id));
      }}
      style={style}
    >
      <div
        className={styles["window-container-header"]}
        id={navId}
        onMouseDown={(e) => {
          dragMouseDown(e);
        }}
        onMouseUp={(e) => {
          dispatchRect();
        }}
      >
        <ul className={styles["button-container"]}>
          <li className={styles["btn-close"]} onClick={onCloseBtn} />
          <li className={styles["btn-minimize"]} />
          <li className={styles["btn-maximize"]} onClick={onMaximizeBtn} />
        </ul>
        <span className={styles["window-title"]}>Window - {proc.procId}</span>
      </div>
      <div className={styles["content-container"]}>
        {(props as any).children}
      </div>
    </section>
  );
}
