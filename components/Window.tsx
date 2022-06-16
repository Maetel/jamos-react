import React from "react";
import { useEffect, useRef, useState } from "react";
import { render } from "react-dom";
import { clamp, randomId } from "../scripts/utils";
import styles from "../styles/Window.module.css";

const onCloseBtn = (e) => {};
const onMaximizeBtn = (e: any) => {};

let pos1 = 0,
  pos2 = 0,
  pos3 = 0,
  pos4 = 0;

function dragMouseDown(e: any) {
  console.log("dragMouseDown");
  const el = e.currentTarget.parentElement;
  if (!el) {
    console.log("el eempty");
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
export default class Window extends React.Component {
  private winElem: HTMLElement | undefined;
  private navElem: HTMLElement | undefined;
  private winId: string = randomId();
  private navId: string = randomId();
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.winElem = document.querySelector(`#${this.winId}`) as HTMLElement;
    this.navElem = document.querySelector(`#${this.navId}`) as HTMLElement;
    console.log("Winelem : ", this.winElem);
  }

  render() {
    console.log("Window props : ", this.props);
    return (
      <section className={styles["window-container"]} id={this.winId}>
        <div
          className={styles["window-container-header"]}
          id={this.navId}
          onMouseDown={(e) => {
            dragMouseDown(e);
          }}
        >
          <ul className={styles["button-container"]}>
            <li className={styles["btn-close"]} onClick={onCloseBtn} />
            <li className={styles["btn-minimize"]} />
            <li className={styles["btn-maximize"]} onClick={onMaximizeBtn} />
          </ul>
          <span className={styles["window-title"]}>Window</span>
        </div>
        <div className={styles["content-container"]}>
          {(this.props as any).children}
        </div>
      </section>
    );
  }
}
