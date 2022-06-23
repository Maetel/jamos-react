import { useState } from "react";
import { useAppSelector } from "../app/hooks";
import Window from "../components/Window";
import SetMgr from "../features/settings/SetMgr";
import officialThemes from "../features/settings/Themes";
import styles from "../styles/Styler.module.css";

export default function Styler(props) {
  const setmgr = SetMgr.getInstance();
  const [prevTheme, setPrevTheme] = useState(setmgr.themeValue().name);
  const clicked = setmgr.themeReadable(useAppSelector).name;
  const themes = officialThemes;
  const [intro, setIntro] = useState("Click to Apply!");

  const proc = { ...props.proc };
  proc.name = proc.name ?? "Styler";
  proc["rect"] = {
    width: 400,
    height: 210 + themes.length * 33,
  };
  proc["resize"] = "none";

  const ThemeButton = (btnProps) => {
    const theme = btnProps.theme;
    const style = {
      color: theme.colors["1"],
      backgroundColor: theme.colors["2"],
      border: `1px solid ${theme.colors["3"]}`,
    };
    let ulBg = theme.colors["1"];
    const isClicked = () => clicked === theme.name;
    if (isClicked()) {
      const temp = style.color;
      style.color = style.backgroundColor;
      style.backgroundColor = temp;
      style.border = `5px solid ${theme.colors["3"]}`;
      ulBg = theme.colors["2"];
      style["fontSize"] = "1.5rem";
      style["fontWeight"] = "700";
      style["textDecoration"] = "underline";
    }

    return (
      <button
        style={{ ...style, position: "relative" }}
        className={styles.btn}
        onMouseEnter={() => {
          // setPrevTheme(() => setmgr.themeValue().name);
          // setmgr.setTheme(theme.name);
        }}
        onMouseLeave={() => {
          // setmgr.setTheme(prevTheme);
        }}
        onClick={() => {
          setPrevTheme(() => theme.name);
          setmgr.setTheme(theme.name);
          setIntro(`Style set to ${theme.name}!`);
          // setClicked(() => theme.name);
        }}
      >
        {theme.name}
        <ul
          className={styles.colorList}
          style={{
            backgroundColor: ulBg,
          }}
        >
          <li
            className={styles.colorBtn}
            style={{
              backgroundColor: theme.colors["error"],
            }}
          ></li>
          <li
            className={styles.colorBtn}
            style={{
              backgroundColor: theme.colors["warn"],
            }}
          ></li>
          <li
            className={styles.colorBtn}
            style={{
              backgroundColor: theme.colors["okay"],
            }}
          ></li>
        </ul>
        <div
          className={styles.checked}
          style={{ display: isClicked() ? "inline-block" : "none" }}
        >
          &larr;
        </div>
      </button>
    );
  };
  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <h1 className={styles.title}>Styler</h1>
        {/* <p className={styles.content}>Hover on themes to preview</p> */}
        <p className={styles.content}>{intro}</p>
        <div className={styles.btns}>
          {themes.map((theme) => (
            <ThemeButton theme={theme}></ThemeButton>
          ))}
        </div>
      </div>
    </Window>
  );
}