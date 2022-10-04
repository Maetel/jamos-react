import { useEffect } from "react";
import ShimmerImage from "../components/ShimmerImage";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import useEffectOnce from "../scripts/useEffectOnce";
import styles from "../styles/Welcome.module.css";
// import styles from "../styles/";

export default function Welcome(props) {
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "Welcome";
  // proc.hideNav = proc.hideNav ?? true;
  // proc.rect = proc.rect ?? {
  //   width: 480,
  //   height: 360,
  // };
  proc.disableMaxBtn = proc.disableMaxBtn ?? true;
  proc.hideNavButtons = proc.hideNavButtons ?? true;
  proc.hideNav = proc.hideNav ?? true;
  // proc.closeOnEscape = proc.closeOnEscape ?? true;
  // proc.disableBackground = proc.disableBackground ?? true;
  const isInitial = JamOS.procmgr.getReadable(proc.id, "isInitial");

  const colors = JamOS.theme.colors;
  const buildButtonStyle = () => {
    return {
      color: colors["2"],
      backgroundColor: colors["1"],
    };
  };
  const btnStyle = buildButtonStyle();

  useEffectOnce(() => {
    return () => {};
  });
  useEffect(() => {
    if (isInitial) {
      JamOS.procmgr.set(proc.id, {
        rect: {
          top: "50%",
          left: "50%",
          width: 360,
          height: 240,
          transform: "translate( -50%, -50%)",
        },
        disableDrag: true,
        disableBackground: true,
      });
    }
  }, [isInitial]);
  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <h2 className={styles.title}></h2>
        <div className={styles.hero}>
          <div className={styles.logoWrapper}>
            <ShimmerImage src={"/imgs/jamos.png"} layout="fill"></ShimmerImage>
          </div>
        </div>

        <div className={styles.inputArea}>
          <div className={styles.btns}>
            <button
              className={`${styles.btn}`}
              style={btnStyle}
              onClick={(e) => {
                // JamOS.setWorld("sample_world");
                JamOS.procmgr.kill(proc.id);
                JamOS.procmgr.add("jamhub", { isInitial: true });
              }}
            >
              Sign in
            </button>
            <button
              className={`${styles.btn}`}
              style={btnStyle}
              onClick={(e) => {
                // JamOS.setWorld("sample_world");
                JamOS.procmgr.kill(proc.id);
                JamOS.setWorld("sample_world");
              }}
            >
              Try as Guest
            </button>
          </div>
        </div>
      </div>
    </Window>
  );
}
