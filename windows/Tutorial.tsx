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
  proc.rect = proc.rect ?? { width: 800, height: 600 };
  proc.videoIndex = 0;

  const videoIndex = JamOS.procmgr.getReadable(proc.id, "videoIndex") ?? 0;

  return (
    <Window {...props} proc={proc}>
      {/* <div className={styles.container}>dd</div> */}
      <div className={styles.container}>
        <div className={styles.videoWrapper}>
          <video
            controls
            muted
            autoPlay
            loop
            src={`/clips/tutorial/${data.at(videoIndex).title}.webm`}
          ></video>
        </div>
      </div>
    </Window>
  );
}
