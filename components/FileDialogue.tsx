import { useEffect, useRef, useState } from "react";
import CallbackStore from "../features/JamOS/Callbacks";
import Process from "../features/procmgr/ProcTypes";
import { FinderCore } from "../windows/Finder";
import Window from "./Window";
import styles from "../styles/FileDialogue.module.css";
import JamOS from "../features/JamOS/JamOS";
import { Node } from "../features/file/FileTypes";
import Path from "../scripts/Path";

export interface FileDialProps {
  parent: string;
  type: "Save" | "Load";
  includes?: string[]; // ex) ['image', 'text']
  excludes?: string[];
  onOkayCallbackId?: string;
  onCancelCallbackId?: string;
  onExitCallbackId?: string;
}

export default function FileDialogue(props) {
  const proc: Process = { ...props.proc };
  const fileDialProps: FileDialProps = proc.fileDialProps;
  proc.rect = proc.rect ?? {
    top: "20%",
    left: "20%",
    width: "60%",
    height: "60%",
  };
  proc.name = proc.name ?? "File Dialogue";
  proc.disableBackground = true;
  // proc.disableDrag = false;
  proc.hideNav = false;
  proc.path = "~";
  proc.blockExeFile = true;
  proc.callbackId = `FileDialogue-${proc.id}`;

  const colors = JamOS.theme.colors;
  const procmgr = JamOS.procmgr;
  const inputValue = procmgr.getReadable(proc.id, "inputValue");
  const inputElem = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    //register FinderCore.onIconClick
    CallbackStore.registerById(proc.callbackId, (params) => {
      const node: Node = params;
      procmgr.set(proc.id, { inputValue: new Path(node.path).last ?? "" });
      if (inputElem.current) {
        inputElem.current.focus();
        const len = inputElem.current.value?.length;
        if (len) {
          //exists and len>0
          inputElem.current.setSelectionRange(0, len);
        }
      }
      // console.log("registerById, params:", params);
    });
  }, []);

  const handleOkay = (e) => {
    const val = Path.join(
      procmgr.getValue(proc.id, "currentPath") ?? "",
      procmgr.getValue(proc.id, "inputValue")
    ).path;
    procmgr.set(proc.parent, { fileDial: val });
    CallbackStore.getById(fileDialProps.onOkayCallbackId)?.(val);
    CallbackStore.getById(fileDialProps.onExitCallbackId)?.(val);
    procmgr.kill(proc.id);
  };
  const handleCancel = (e) => {
    const val = Path.join(
      procmgr.getValue(proc.id, "currentPath") ?? "",
      procmgr.getValue(proc.id, "inputValue")
    ).path;
    CallbackStore.getById(fileDialProps.onCancelCallbackId)?.(val);
    CallbackStore.getById(fileDialProps.onExitCallbackId)?.(val);
    procmgr.kill(proc.id);
  };

  const handleKey = (e) => {
    const isFront = JamOS.procmgr.getValue(proc.id, "zIndex") === "0";
    if (!isFront) {
      return;
    }
    const keyMap = {
      Enter: handleOkay,
      Escape: handleCancel,
    };
    keyMap[e.key]?.(e);
  };
  useEffect(() => {
    if (inputElem.current) {
      inputElem.current.focus();
    }
    setTimeout(() => {
      window.addEventListener("keydown", handleKey);
    }, 300);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, []);
  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <div className={styles.browse}>
          <FinderCore proc={proc}></FinderCore>
        </div>
        <div
          className={styles.controlArea}
          style={{
            borderTop: `1px solid ${colors["1"]}`,
          }}
        >
          <div className={styles.cushion}></div>
          <span className={styles.pathContainer}>
            <span className={styles.pathIndicator}>
              {(fileDialProps.includes
                ? fileDialProps.includes.map((ext) => `${ext}`).join(", ") +
                  " file path :"
                : "File path :"
              ).trim()}
            </span>
            <textarea
              ref={inputElem}
              className={styles.input}
              value={inputValue}
              onChange={(e) => {
                procmgr.set(proc.id, { inputValue: e.target.value });
              }}
              spellCheck={false}
              rows={1}
            ></textarea>
          </span>

          <span className={styles.btns}>
            <button className={styles.btn} onClick={handleOkay}>
              {fileDialProps.type}
            </button>
            <div className={styles.cushion}> </div>
            <button className={styles.btn} onClick={handleCancel}>
              Cancel
            </button>
          </span>
          <div className={styles.cushion}> </div>
        </div>
      </div>
    </Window>
  );
}
