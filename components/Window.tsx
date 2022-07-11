import Image from "next/image";
import React from "react";
import { useEffect, useRef, useState } from "react";
import CallbackStore from "../features/JamOS/Callbacks";
import JamOS from "../features/JamOS/JamOS";
import Log from "../features/log/Log";

import Process, { Rect } from "../features/procmgr/ProcTypes";
import { ThemeColors } from "../features/settings/Themes";
import { ToolbarControl } from "../grounds/Toolbar";
import useEffectOnce from "../scripts/useEffectOnce";
import { clamp, randomId } from "../scripts/utils";
import styles from "../styles/Window.module.css";
import ShimmerImage from "./ShimmerImage";

const translucentBackground = "55";
const minHeight = 240;
const minWidth = 300;
let pos1 = 0,
  pos2 = 0,
  pos3 = 0,
  pos4 = 0;
let maximizeTransition = "0.3s";

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

  const procmgr = JamOS.procmgr;
  const proc: Process = { ...props.proc };
  const {
    hideNav,
    hideNavButtons,
    opaqueBackground,
    closeOnBackgroundClick,
    disableBackground,
    disableDrag,
    disableMinBtn,
    disableCloseBtn,
    disableMaxBtn,
  } = proc;
  // proc["disableMinBtn"] = true;
  const btnMaxClass = proc["disableMaxBtn"] ? styles.disabled : "";
  const btnMinClass = proc["disableMinBtn"] ? styles.disabled : "";
  const btnCloseClass = proc["disableCloseBtn"] ? styles.disabled : "";

  proc.name = proc.name ?? (hideNav ? "" : "Application");
  const get = (prop) => procmgr.getReadable(proc.id, prop);
  // const get = (prop) => procmgr.get(proc.id, prop);

  ////////////////// rect / style / theme
  const rectReadable: Rect = get("rect");
  const beginBlink = procmgr.getReadable(proc.id, "beginBlink");
  const endBlink = procmgr.getReadable(proc.id, "endBlink");
  const [blinking, setBlinking] = useState(false);
  const onBlink = () => {
    setBlinking((val) => !val);
  };
  useEffect(() => {
    if (beginBlink) {
      const id = setInterval(onBlink, 60);
      procmgr.set(proc.id, { blinkIntervalId: id });
      procmgr.set(proc.id, { endBlink: false });
    }
  }, [beginBlink]);
  useEffect(() => {
    if (endBlink) {
      const id = procmgr.getValue(proc.id, "blinkIntervalId");
      clearInterval(id);
      procmgr.set(proc.id, { beginBlink: false });
    }
  }, [endBlink]);
  const _colors = JamOS.theme.colors;
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
          // console.log(`rect[${key}]=${rect[key]}`);
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
      retval["boxShadow"] =
        beginBlink && !endBlink && blinking ? "none" : _colors["boxShadow"];
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
    setContElemStyle(buildStyle(rectReadable));
  }, [blinking]);
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
          "minWidth",
          "minHeight",
          "transform",
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

    {
      // console.log(proc.name, ": disableBackground:", disableBackground);
    }

    if (proc.hideOnDock) {
      procmgr.set(proc.id, { hideOnDock: true });
    }
  }, []);

  useEffectOnce(() => {
    CallbackStore.getById(procmgr.getValue(proc.id, "onMount"))?.();
    return () => {
      CallbackStore.getById(procmgr.getValue(proc.id, "onDestroy"))?.();
    };
  });

  // console.log("rectReadable:", rectReadable);

  //////////////////////////////////// register Toolbar.quit()
  /*
        'Cannot update a component (`Toolbar`) while rendering a different component (`Toolbar`). To locate the bad setState() call inside `Toolbar`'
        */
  useEffect(() => {
    if (proc.hideOnToolbar) {
      return;
    }
    ToolbarControl.RegisterBuilder(proc.id).register(
      proc.name,
      `Quit ${proc.name}`,
      () => {
        procmgr.kill(proc.id);
        // addHelp();
      },
      { separator: true, order: -1 }
    );
  }, []);

  //////////////////////////////////// drag events
  function dragMouseDown(e: any) {
    // const el = e.currentTarget.parentElement;
    const el = _winElem.current;
    if (!el) {
      Log.error("el empty");
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

  useEffect(() => {
    if (isFront) {
      CallbackStore.getById(procmgr.getValue(proc.id, "onFront"))?.();
    } else {
      CallbackStore.getById(procmgr.getValue(proc.id, "onFocusOut"))?.();
    }
  }, [isFront]);

  ////////////////// detect resize
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      // console.log("Borderbox: ", entry.borderBoxSize.at(0));
      // console.log("ContentBoxSize: ", entry.contentBoxSize.at(0));
    }
  });

  const [navHovered, setNavHovered] = useState(false);
  const buildNavStyle = () => {
    const retval = {};
    retval["color"] = _colors["2"];
    retval["backgroundColor"] = _colors["1"];
    if (proc.disableDrag || hideNav) {
      retval["cursor"] = "auto";
    }
    if (hideNav) {
      // retval["display"] = "none";
      retval["color"] = _colors["1"];
      retval["backgroundColor"] = "transparent";
    }
    return retval;
  };
  const buildMaxBtnStyle = () => {
    const retval = { backgroundColor: _colors["okay"] };
    if (proc.disableMaxBtn) {
      retval.backgroundColor = retval.backgroundColor + translucentBackground;
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
  const closeBtnStyle = {
    backgroundColor: disableCloseBtn
      ? _colors["error"] + translucentBackground
      : _colors["error"],
  };
  const minBtnStyle = {
    backgroundColor: disableMinBtn
      ? _colors["warn"] + translucentBackground
      : _colors["warn"],
  };
  const maxBtnStyle = {
    backgroundColor: disableMaxBtn
      ? _colors["okay"] + translucentBackground
      : _colors["okay"],
  };

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

  const Header = (props) => {
    return (
      <div
        className={`${styles["window-container-header"]} ${styles.grabbable}`}
        id={navId}
        ref={_navElem}
        onMouseDown={(e) => {
          if (!isMax && !disableDrag) {
            dragMouseDown(e);
          }
          proc.onFocus?.();
        }}
        style={navElemStyle}
      >
        {props.src && (
          <ShimmerImage
            // height={30}
            // width={100}
            layout="fill"
            src={props.src}
            objectFit="cover"
            // style={{ position: "absolute", top: 0, left: 0 }}
          ></ShimmerImage>
        )}
        <span className={styles["window-title"]}>
          {hideNav ? "" : proc.name}
        </span>
      </div>
    );
  };

  const NestedBody = (props) => {
    return (
      <div
        className={styles["content-container"]}
        onClick={(e) => {
          proc.onFocus?.();
        }}
        style={{
          position: hideNav ? "absolute" : "relative",
          top: 0,
          height: hideNav ? "100%" : "calc(100% - 30px)",
        }}
      >
        {(props as any).children}
      </div>
    );
  };

  const Buttons = (props) => {
    const bg = hideNav ? _colors["1"] : _colors["2"];
    return (
      <ul
        className={styles["button-container"]}
        style={{
          backgroundColor: navHovered ? bg : "transparent",
          display: hideNavButtons ? "none" : "flex",
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
    );
  };

  const bgColor = opaqueBackground ? _colors["2"] + "77" : "transparent";

  const contentBgSrc = undefined;
  return (
    <>
      {disableBackground && (
        <div
          className="disableBackground"
          style={{
            position: "absolute",
            top: "0px",
            left: "0px",
            width: "100vw",
            height: "100vh",
            backgroundColor: bgColor,
            // cursor: "not-allowed",
          }}
          onClick={(e) => {
            CallbackStore.getById(proc.onBackgroundClick)?.();
            if (closeOnBackgroundClick) {
              procmgr.kill(proc.id);
            }
          }}
        ></div>
      )}
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
          className={styles["content-container"]}
          onClick={(e) => {
            CallbackStore.getById(procmgr.getValue(proc.id, "onClick"))?.(e);
          }}
          style={{
            // position: hideNav ? "absolute" : "relative",
            top: hideNav ? 0 : 30,
            height: hideNav ? "100%" : "calc(100% - 30px)",
          }}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDragEnter={(e) => {
            CallbackStore.getById(procmgr.getValue(proc.id, "onDragEnter"))?.(
              e
            );
          }}
          onDragLeave={(e) => {
            CallbackStore.getById(procmgr.getValue(proc.id, "onDragLeave"))?.(
              e
            );
          }}
          onDrop={(e) => {
            CallbackStore.getById(procmgr.getValue(proc.id, "onDrop"))?.(e);
          }}
        >
          {contentBgSrc && (
            <ShimmerImage
              // height={30}
              // width={800}
              layout="fill"
              src={contentBgSrc}
              style={{ position: "absolute", top: 0, left: 0 }}
            ></ShimmerImage>
          )}
          {(props as any).children}
        </div>
        {!hideNav && !disableDrag && <Header></Header>}
        <Buttons></Buttons>
      </section>
    </>
  );
}
