import { useEffect } from "react";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import styles from "../styles/Tutorial.module.css";

interface TutorialItem {
  title: string; //src = clips/tutorial/{title}.webm
  desc?: string;
}

const data: TutorialItem[] = [
  { title: "AppStore" },
  { title: "Finder" },
  { title: "Terminal" },
  { title: "Styler" },
  { title: "ImageViewer" },
  { title: "Notifications" },
];

export default function Tutorial(props) {
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "";

  const colors = JamOS.theme.colors;
  const videoIndex = JamOS.procmgr.getReadable(proc.id, "videoIndex") ?? 0;

  const handleKeydown = (e) => {
    //https://codewithhugo.com/detect-ctrl-click-js-react-vue/
    const isFront = JamOS.procmgr.isFrontValue(proc.id);
    if (!isFront) {
      return;
    }
    //combination
    switch (e.key) {
      case "ArrowRight":
        toNext();
        break;
      case "ArrowLeft":
        toPrev();
      default:
        break;
    }
  };

  useEffect(() => {
    JamOS.procmgr.set(proc.id, { videoIndex: 0 });
    JamOS.procmgr.set(proc.id, {
      rect: {
        width: "90%",
        height: "90%",
        top: "5%",
        left: "5%",
      },
    });

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  const toNext = () => {
    let idx = JamOS.procmgr.getValue(proc.id, "videoIndex");
    idx++;
    if (idx >= data.length) {
      idx = 0;
    }
    JamOS.procmgr.set(proc.id, { videoIndex: idx });
  };

  const toPrev = () => {
    let idx = JamOS.procmgr.getValue(proc.id, "videoIndex");
    idx--;
    if (idx < 0) {
      idx = data.length - 1;
    }
    JamOS.procmgr.set(proc.id, { videoIndex: idx });
  };

  return (
    <Window {...props} proc={proc}>
      {/* <div className={styles.container}>dd</div> */}
      <div className={styles.container}>
        <div className={styles.videoWrapper}>
          <video
            className={styles.theVideo}
            controls
            muted
            autoPlay
            loop
            src={`/clips/tutorial/${data.at(videoIndex).title}.webm`}
          ></video>
        </div>
        <div className={styles.arrows}>
          <button
            className={styles.arrow}
            onClick={toPrev}
            style={{ color: colors["1"] }}
          >
            &#10918;
          </button>
          <span className={styles.desc}>
            {data[videoIndex].title} [{videoIndex + 1}/{data.length}]
          </span>
          <button
            className={styles.arrow}
            style={{ color: colors["1"] }}
            onClick={toNext}
          >
            &#10919;
          </button>
        </div>
      </div>
    </Window>
  );
}
