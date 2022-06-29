import { useEffect, useState } from "react";
import JamOS from "../features/JamOS/JamOS";
import { Rect } from "../features/procmgr/ProcTypes";
import { ThemeColors } from "../features/settings/Themes";
import styles from "../styles/DialogueWindow.module.css";

export interface DialogueProps {
  type: string; // 'buttons' | '
  cancel: () => void;
  setValue: (params) => any;
  rect?: Rect;
  title?: string;
  descs?: string[];
  elem?: JSX.Element;
  buttons?: string[];
  callbacks?: ((params) => boolean)[];
}

export default function DialogueWindow(props) {
  const dial: DialogueProps = props.dial;
  const [internalValue, setInternalValue] = useState(null);
  const setValue = dial.setValue;
  const rect = dial.rect ?? {
    top: "25%",
    left: "25%",
    width: "50%",
    height: "50%",
  };
  const colors: ThemeColors = JamOS.theme().colors;

  const [style, setStyle] = useState((dial?.rect ?? rect) as {});

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
    setStyle(() => st);
  }, [colors]);

  const cancelDialogue = (e) => {
    console.log("Dialogue escape");
    setValue(undefined);
    dial.cancel();
    // dial.callbacks.at(dial.callbacks.length - 1);
  };

  const handleKey = (e) => {
    if (!dial.callbacks && dial.callbacks.length > 0) {
      return;
    }
    // e.preventDefault();
    switch (e.key) {
      case "Escape":
        cancelDialogue(e);
        break;
      case "Enter":
        dial.callbacks.at(0)?.(internalValue);
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
        <span className={styles.navTitle}>{dial.title ?? "Alert"}</span>
      </div>
      <div className={styles.dialBody}>
        <h1 className={`${styles.content} ${styles.title}`}>
          {dial.title ?? "Alert"}
        </h1>
        {dial.descs?.map((desc, i) => (
          <div key={i} className={`${styles.content} ${styles.desc}`}>
            {desc}
          </div>
        ))}
        <div className={styles.buttons}>
          {dial.buttons?.map((btn, i) => (
            <button
              key={i}
              className={styles.button}
              onClick={(e) => {
                dial.callbacks[i]?.(internalValue);
              }}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : undefined;
}
