import { useEffect, useRef } from "react";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import Modal, { ModalCallbackChannel, ModalProps } from "./Modal";
import styles from "../styles/TextModal.module.css";

export default function TextModal(props) {
  const callbackChannel: ModalCallbackChannel = [
    (param: (params?: any) => any) => {
      if (typeof param === "function") {
        const val = procmgr.getValue(proc.id, "inputValue");
        param(val);
      }
    },
  ];
  const procmgr = JamOS.procmgr;
  const proc: Process = { ...props.proc };
  const modal: ModalProps = proc.modal;
  proc.rect = {
    width: 500,
    height: 320,
  };
  proc.disableDrag = false;
  const inputElem = useRef<HTMLTextAreaElement>(null);
  const inputValue = procmgr.getReadable(proc.id, "inputValue") ?? "";

  useEffect(() => {
    inputElem.current.focus();
    procmgr.set(proc.id, { inputValue: modal.placeholder ?? "" });
  }, []);

  return (
    <Modal {...props} proc={proc} callbackChannel={callbackChannel}>
      <div className={styles.container}>
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
      </div>
    </Modal>
  );
}
