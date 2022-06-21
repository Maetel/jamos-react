import Window from "../components/Window";
import Loading from "../components/Loading";
import styles from "../styles/Browser.module.css";
import { useState } from "react";
import ProcMgr from "../features/procmgr/ProcMgr";

export default function Browser(props) {
  // console.log("Browser prsop : ", props);
  const proc = { ...props.proc };
  proc.name = proc.name ?? "JamBrowser";
  const currentPath = proc.path;
  let contentSrc = currentPath ?? "";
  const onMountSetter = proc.onMountSetter;
  const allow = proc.youtube
    ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    : "";

  let finderElem: HTMLElement, backBtn: HTMLElement, forwardBtn: HTMLElement;
  const browseBack = (e) => {};
  const browseForward = (e) => {};
  const refreshPage = (e) => {};
  const contentLoaded = (e) => {
    setIsLoading(false);
    ProcMgr.getInstance().maximize(proc.id);
  };
  const [isLoading, setIsLoading] = useState(true);
  const barHeight = "40px";

  return (
    <Window {...props} proc={proc}>
      {isLoading ? <Loading barHeight={barHeight} /> : undefined}
      <div className={styles.container}>
        <div className={styles.browser}>
          <button
            className={`${styles.browserContent} ${styles.button} ${styles.back}`}
            onClick={browseBack}
          >
            &larr;
          </button>
          <button
            className={`${styles.browserContent} ${styles.button} ${styles.forward}`}
            onClick={browseForward}
          >
            &rarr;
          </button>
          <button
            className={`${styles.browserContent} ${styles.button} ${styles.refresh}`}
            onClick={refreshPage}
          >
            &#8634;
          </button>
          <span className={`${styles.browserContent} ${styles.path}`}>
            {currentPath}
          </span>
        </div>
        <div className={styles.contentContainer}>
          {!contentSrc || contentSrc.length === 0 ? (
            <div className={styles.content}>뭘 열어야 할 지 알 수가 없어요</div>
          ) : (
            <iframe
              title="browser-content"
              className={styles.content}
              src={contentSrc}
              frameBorder={0}
              // bind:this={contentElem}
              onLoad={contentLoaded}
              allow={allow}
              allowFullScreen
            >
              <p>{contentSrc}는 JamBrowser에서 열 수가 없어요🙄</p>
            </iframe>
          )}
        </div>
      </div>
    </Window>
  );
}
