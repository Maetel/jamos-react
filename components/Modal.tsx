import Window from "./Window";
import styles from "../styles/Modal.module.css";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import { useEffect, useRef, useState } from "react";
import { ToolbarControl } from "../grounds/Toolbar";
import { clamp } from "../scripts/utils";

export type ModalCallback = (params?) => any;
export class ModalCallbacks {
  public static callbacks: { [key: string]: ModalCallback } = {};
  constructor() {}
  static register(procId: string, cb: ModalCallback) {
    this.callbacks[procId] = cb;
  }
  static exe(procId: string, params?) {
    // console.log("ModalCallbacks.exe with ", procId, ", params : ", params);
    return this.callbacks[procId]?.(params);
  }
}

export interface ModalProps {
  parent: string;
  title?: string;
  descs?: string[];
  buttons?: string[];
}

export default function Modal(props) {
  const proc: Process = { ...props.proc };
  const modal: ModalProps = proc.modal;
  proc.rect = proc.rect ?? {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "400px",
    height: "300px",
    transform: "translate(-200px, -150px)",
  };
  proc.name = proc.name ?? modal.title ?? "";
  proc.disableBackground = proc.disableBackground ?? true;
  // proc.disableDrag = false;
  proc.hideNav = proc.hideNav ?? true;
  console.log("proc.hideNav:", proc.hideNav);

  const colors = JamOS.theme.colors;
  const procmgr = JamOS.procmgr;
  const modalElem = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modal.buttons?.forEach((btn, i) => {
      const isLast = i === modal.buttons.length - 1;
      const additional = isLast ? { separator: true } : {};

      ToolbarControl.RegisterBuilder(proc.id).register(
        proc.name,
        btn,
        () => {
          updateModalResult(btn);
          closeThis();
        },
        additional
      );
    });

    //focus on load
    // const btns = document.querySelectorAll(`.${styles.btn}`);
    // if (btns.length > 0) {
    //   (btns[0] as HTMLElement)?.focus();
    // }
  }, []);

  const updateModalResult = (val: string) => {
    procmgr.set(modal.parent, { modalRetval: val });
  };
  const [focusIdx, setFocusIdx] = useState(modal.buttons ? 0 : null);

  const handleKeydown = (e) => {
    // 'Enter' : left button
    // 'ESC' : right button
    let res = undefined;
    // e.preventDefault();
    const keyMap = {
      Enter: () => {
        const idx = procmgr.getValue(proc.id, "focusIdx");
        if (idx === undefined) {
          return;
        }
        const res = modal.buttons?.at(idx);
        updateModalResult(res);
        closeThis();
      },
      Escape: () => {
        // setRes(modal.buttons?.at((modal.buttons?.length ?? 0) - 1));
        if (modal.buttons) {
          res = modal.buttons?.at(modal.buttons?.length - 1);
          updateModalResult(res);
        }
        closeThis();
      },
      ArrowLeft: focusLeft,
      ArrowRight: focusRight,
    };
    keyMap[e.key]?.();
  };

  const len = modal.buttons?.length - 1 ?? 1;
  // useEffect(() => {
  //   setFocus(clamp(focusIdx, 0, len));
  // }, [focusIdx]);

  useEffect(() => {
    procmgr.set(proc.id, { focusIdx: focusIdx });
  }, [focusIdx]);

  const focusLeft = () => {
    setFocusIdx((idx) => {
      if (idx === null) {
        return 0;
      }
      return clamp(idx - 1, 0, len);
    });
  };

  const focusRight = () => {
    setFocusIdx((idx) => {
      if (idx === null) {
        return 0;
      }
      return clamp(idx + 1, 0, len);
    });
  };

  useEffect(() => {
    (
      document.querySelector(
        `.${styles.buttons} .${styles.btn}.btn0`
      ) as HTMLElement
    )?.focus();

    setTimeout(() => {
      //wait a bit before addEventListener
      window.addEventListener("keydown", handleKeydown);
    }, 300);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  const closeThis = () => {
    procmgr.kill(proc.id);
  };

  const buildButtonStyle = (idx: number) => {
    const retval = {
      color: colors["2"],
      backgroundColor: colors["1"] + "99",
      border: `1px solid ${colors["3"]}99`,
    };
    const isFocused = focusIdx === idx;
    if (isFocused) {
      retval["boxShadow"] = `1px 1px 4px ${colors["3"]}`;
      retval["transform"] = "translate(-4px, -4px)";
      retval["border"] = `1px solid ${colors["3"]}`;
      retval["color"] = colors["2"];
      retval["backgroundColor"] = colors["1"];
    }
    return retval;
  };

  return (
    <Window {...props} proc={proc}>
      <div className={`${styles.container}`} style={{ color: colors["1"] }}>
        {/* <div className={`${styles.background}`} onClick={closeThis} /> */}
        <div className={`${styles.contents}`}>
          {proc.hideNav && (
            <div className={`${styles.title}`}>{modal.title ?? ""}</div>
          )}
          {props.children ? (
            props.children
          ) : (
            <div className={styles.descs}>
              {modal.descs?.map((desc, i) => {
                return (
                  <div
                    style={{ color: colors["1"] }}
                    key={i}
                    className={`${styles.desc}`}
                  >
                    {desc}
                  </div>
                );
              })}
            </div>
          )}

          <div className={`${styles.buttons}`}>
            {modal.buttons?.map((btn, i) => (
              <button
                className={`${styles.btn} btn${i}`}
                onClick={() => {
                  updateModalResult(btn);
                  closeThis();
                }}
                onMouseEnter={() => {
                  setFocusIdx(i);
                }}
                onMouseLeave={() => {
                  setFocusIdx(null);
                }}
                tabIndex={i}
                key={i}
                style={buildButtonStyle(i)}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Window>
  );
}
