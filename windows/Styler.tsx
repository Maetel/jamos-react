import { useEffect, useState } from "react";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import officialThemes, { defaultTheme } from "../features/settings/Themes";
import { ToolbarControl } from "../grounds/Toolbar";
import styles from "../styles/Styler.module.css";

export default function Styler(props) {
  /////////////////////////
  const registerToolbarCallback = () => {
    const builder = ToolbarControl.RegisterBuilder(proc.id)
      .register(
        "Styler",
        "About",
        () => {
          // ProcMgr.getInstance().kill(proc.id);
          JamOS.procmgr.add("simpleabout", {
            aboutProps: {
              title: "About Styler",
              desc: "Change theme as your taste!",
            },
            parent: proc.id,
          });
        }
        // { separator: true, disabled: true }
      )
      .register(
        "Edit",
        `Set to default style : ${defaultTheme.name}`,
        () => {
          setmgr.setTheme(defaultTheme.name);
        },
        { separator: true }
      );
    officialThemes.forEach((theme) => {
      builder.register("Edit", `Set to ${theme.name}`, () => {
        setmgr.setTheme(theme.name);
      });
    });
  };
  useEffect(() => {
    registerToolbarCallback();
  }, []);

  const setmgr = JamOS.setmgr;
  const [prevTheme, setPrevTheme] = useState(setmgr.themeValue().name);
  const clicked = JamOS.theme.name;
  const themes = officialThemes;
  const [intro, setIntro] = useState("Click to Apply!");

  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "Styler";
  proc.hideNav = true;
  proc["rect"] = {
    width: 400,
    height: 210 + themes.length * 33,
  };
  proc["resize"] = "none";
  proc.disableMaxBtn = true;

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
          {themes.map((theme, i) => (
            <ThemeButton theme={theme} key={i}></ThemeButton>
          ))}
        </div>
      </div>
    </Window>
  );
}
