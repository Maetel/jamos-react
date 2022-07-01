import { useEffect, useRef, useState } from "react";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import { Rect } from "../features/procmgr/ProcTypes";
import styles from "../styles/About.module.css";

export default function About(props) {
  const proc = { ...props.proc };
  proc.name = proc.name ?? "About";
  const rect: Rect = {
    top: "20%",
    left: "20%",
    width: "60%",
    height: "60%",
  };
  proc.rect = rect;
  proc.resize = "none";
  const bgTopElem = useRef(null);
  const bgBottomElem = useRef(null);
  const textElem = useRef(null);
  const msgElem = useRef(null);
  const [clicked, setClicked] = useState(false);
  const msg = clicked ? "Copied!" : "Click to copy";
  const colors = JamOS.theme().colors;
  const color1 = colors["1"];
  const color2 = colors["2"];

  const _copy = (e) => {
    setClicked(true);
    navigator.clipboard.writeText("iamjam4944@gmail.com");
    msgElem.current.style.setProperty("color", color1);
    msgElem.current.style.setProperty("background-color", color2);
    msgElem.current.style.setProperty("padding", "3px");
    msgElem.current.style.setProperty("border-radius", "7px");
  };

  const _redirect = (e) => {
    window.open("https://github.com/Maetel/jamos-react");
  };

  const toggleFunc = () => {
    bgTopElem.current.classList.add(styles.active);
    bgBottomElem.current.classList.add(styles.active);
  };

  useEffect(() => {
    bgTopElem.current.style.setProperty("background-color", color1);
    bgBottomElem.current.style.setProperty("background-color", color2);
    setTimeout(toggleFunc, 1);
    setTimeout(() => {
      if (!bgTopElem) {
        //if closed too early
        return;
      }
      if (bgTopElem.current) {
        bgTopElem.current.style.opacity = "0";
      }
      if (bgBottomElem.current) {
        bgBottomElem.current.style.opacity = "0";
      }

      if (textElem.current) {
        const children = textElem.current.children;
        for (let i = 0; i < children.length; ++i) {
          if (!children[i]) {
            break;
          }
          (children[i] as HTMLElement).style.color = "#222";
        }
      }
    }, 1500);
  }, []);

  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <div className={`${styles.background} ${styles.top}`} ref={bgTopElem} />
        <div
          className={`${styles.background} ${styles.bottom}`}
          ref={bgBottomElem}
        />
        <div className={styles["icon-container"]}>
          <img
            className={styles.icon}
            src="/imgs/jamos512.png"
            alt="JamOS logo"
          />
        </div>
        <div className={styles["text-container"]} ref={textElem}>
          <h1 className={`${styles.t} ${styles.title}`}>JamOS v0.1</h1>
          <p className={`${styles.t} ${styles.desc}`}>
            designed & developed by Wonjun Hwang
          </p>
          <p className={`${styles.t} ${styles.desc}`}>
            Source code :{" "}
            <strong className={styles.copiable} onClick={_redirect}>
              <span className={styles.underline} />
              https://github.com/Maetel/jamos-react
            </strong>
          </p>
          <p className={`${styles.t} ${styles.desc}`}>
            contact :{" "}
            <strong className={styles.copiable} onClick={_copy}>
              <span className={styles.underline} />
              iamjam4944@gmail.com
              <span className={styles.clicked} ref={msgElem}>
                {msg}
              </span>
            </strong>
          </p>
        </div>
      </div>
    </Window>
  );
}
