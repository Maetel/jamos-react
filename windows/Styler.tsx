import { useEffect, useState } from "react";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import officialThemes, {
  BgImg,
  defaultTheme,
  officialBackgrounds,
  Theme,
} from "../features/settings/Themes";
import styles from "../styles/Styler.module.css";

export default function Styler(props) {
  /////////////////////////
  const registerToolbarCallback = () => {
    const builder = JamOS.procmgr
      .addToolbarItem(
        proc.id,
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
      .addToolbarItem(
        proc.id,
        "Edit",
        `Set to default style : ${defaultTheme.name}`,
        () => {
          setmgr.setTheme(defaultTheme.name);
        },
        { separator: true }
      );
    officialThemes.forEach((theme) => {
      builder.addToolbarItem(proc.id, "Edit", `Set to ${theme.name}`, () => {
        setmgr.setTheme(theme.name);
      });
    });
  };
  useEffect(() => {
    registerToolbarCallback();
  }, []);

  const setmgr = JamOS.setmgr;
  const curTheme = JamOS.theme;
  const themes = officialThemes;
  const bgs = officialBackgrounds;
  const curBg: BgImg = setmgr.getReadable("bg");
  // const curBg = bgs.at(0);
  const isActive = (bg: BgImg) => bg.type === curBg?.type;

  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "Styler";
  proc.hideNav = true;
  proc["rect"] = {
    width: 400,
    height: 210 + themes.length * 33,
  };
  proc["resize"] = "none";
  proc.disableMaxBtn = true;

  const buildBtnStyle = (theme: Theme) => {
    const isActive = theme.name === curTheme.name;
    const retval = {
      color: theme.colors["1"],
      backgroundColor: theme.colors["2"],
      border: `1px solid ${theme.colors["3"]}`,
    };
    if (isActive) {
      const temp = retval.color;
      retval.color = retval.backgroundColor;
      retval.backgroundColor = temp;
      retval.border = `5px solid ${theme.colors["3"]}`;
      // ulBg = theme.colors["2"];
      retval["fontSize"] = "1.5rem";
      retval["fontWeight"] = "700";
      retval["textDecoration"] = "underline";
    }
    return retval;
  };

  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <h1 className={styles.title}>Styler</h1>
        {/* <p className={styles.content}>Hover on themes to preview</p> */}
        <div className={styles.content}>
          <div
            className={styles.bgTitle}
            style={{ textAlign: "center", marginBottom: "10px" }}
          >
            Background
          </div>
          <ul className={styles.bgList}>
            {bgs.map((bg) => (
              <button
                className={styles.bgItem}
                key={bg.title}
                onClick={(e) => {
                  JamOS.setmgr.set("bg", bg);
                }}
                style={{
                  textDecoration: isActive(bg) ? "underline" : "none",
                  fontWeight: isActive(bg) ? 500 : 300,
                }}
              >
                {bg.title}
              </button>
            ))}
          </ul>
        </div>
        <div className={styles.btns}>
          {themes.map((theme, i) => (
            <button
              key={theme.name}
              style={{ ...buildBtnStyle(theme), position: "relative" }}
              className={styles.btn}
              onMouseEnter={() => {
                // setPrevTheme(() => setmgr.themeValue().name);
                // setmgr.setTheme(theme.name);
              }}
              onMouseLeave={() => {
                // setmgr.setTheme(prevTheme);
              }}
              onClick={() => {
                JamOS.setmgr.setTheme(theme.name);
                // setClicked(() => theme.name);
              }}
            >
              {theme.name}
              <ul
                className={styles.colorList}
                style={{
                  backgroundColor:
                    theme.name === curTheme.name
                      ? theme.colors["2"]
                      : theme.colors["1"],
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
                style={{
                  display:
                    theme.name === curTheme.name ? "inline-block" : "none",
                }}
              >
                &larr;
              </div>
            </button>
          ))}
        </div>
      </div>
    </Window>
  );
}
