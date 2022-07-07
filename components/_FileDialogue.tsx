import styles from "../styles/_FileDialogue.module.css";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import { useEffect, useRef, useState } from "react";
import { ToolbarControl } from "../grounds/Toolbar";
import { clamp } from "../scripts/utils";
import Modal, { ModalProps } from "./Modal";
import { Dir } from "../features/file/FileTypes";
import Path from "../scripts/Path";
import Image from "next/image";

interface FileDialProps extends ModalProps {
  type?: string[]; //ex) 'image', 'text', ...
}

export default function FileDialogue(props) {
  const proc: Process = { ...props.proc };
  const modal: FileDialProps = { ...proc.modal };
  modal.buttons = modal.buttons ?? ["Okay", "Cancel"];
  proc.rect = proc.rect ?? {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "600px",
    height: "400px",
    transform: "translate(-300px, -200px)",
  };
  proc.name = proc.name ?? modal.title ?? "File Dialogue";
  proc.disableBackground = true;
  // proc.disableDrag = false;
  proc.hideNav = false;

  const colors = JamOS.theme.colors;
  const procmgr = JamOS.procmgr;
  const filemgr = JamOS.filemgr;
  const homeDir: Dir = filemgr.dirReadable("~");

  const Coll = (props) => {
    const dir: Dir = props.dir;
    const btn = useRef(null);
    const toggleCollapse = (e) => {
      console.log(e.target.classList);
      console.log(
        "e.target.classList.contains(styles.checkbox):",
        e.target.classList.contains(styles.checkbox)
      );
      if (e.target.classList.contains(styles.checkbox)) {
        return;
      }
      btn.current.classList.toggle(styles.active);
      const dirList = btn.current.nextElementSibling;
      dirList.style.display =
        dirList.style.display === "none" ? "block" : "none";
    };
    const path: Path = new Path(dir.node.path);
    const buildPathText = () => {
      if (path.isHome) {
        return "home";
      }
      return path.last;
    };

    const CheckBox = (props) => {
      const onClick: () => void = props.onClick;
      const [checked, setChecked] = useState(false);
      const [src, setSrc] = useState("/imgs/rectunchecked.svg");
      useEffect(() => {
        console.log("checked:", checked);
        setSrc(checked ? "/imgs/rectchecked.svg" : "/imgs/rectunchecked.svg");
      }, [checked]);
      return (
        <span
          className={styles.checkbox}
          onClick={(e) => {
            setChecked((chk) => {
              if (!chk) {
                onClick?.();
              }
              return !chk;
            });
          }}
        >
          <Image src={src} layout="fill"></Image>
        </span>
      );
    };

    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className={`${styles.container}`}>
        <button
          className={`${styles.collapsible}`}
          onClick={toggleCollapse}
          ref={btn}
        >
          <span className={`${styles.openicon} ${isOpen && styles.active}`}>
            <Image src={"/imgs/right.svg"} layout="fill"></Image>
          </span>
          <span className={styles.dirText}>{buildPathText()}</span>

          <CheckBox></CheckBox>
        </button>
        <ul
          className={`${styles["list-container"]} ${styles.dir}`}
          style={{ display: path.isHome ? "block" : "none" }}
        >
          {dir.dirs.map((_dir, i) => {
            return (
              <li className={`${styles.item}`} key={i}>
                <Coll dir={_dir}></Coll>
              </li>
            );
          })}
          <ul className={`${styles["list-container"]} ${styles.item}`}>
            {dir.files.map((file, i) => {
              return (
                <li className={`${styles.item}`} key={i}>
                  {new Path(file.node.path).last}
                  <CheckBox></CheckBox>
                </li>
              );
            })}
          </ul>
        </ul>
      </div>
    );
  };

  proc.modal = modal;
  return (
    <Modal {...props} proc={proc}>
      <Coll dir={homeDir}></Coll>
    </Modal>
  );
}
