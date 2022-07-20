import { useEffect, useState } from "react";
import Window from "../components/Window";
import { Dir } from "../features/file/FileTypes";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import { randomId } from "../scripts/utils";

export default function TestWindow(props) {
  const procmgr = JamOS.procmgr;
  const filemgr = JamOS.filemgr;
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "Test Window";
  proc.resize = proc.resize ?? "both";
  proc.rect = proc.rect ?? {
    width: "200px",
    height: "160px",
  };

  const DirView = (dir: Dir, key = 0) => {
    return (
      <div style={{ marginLeft: 10 }} className="dir-container" key={key}>
        * {dir.node.path} <br></br>
        Dirs :{dir.dirs.map((dir, i) => DirView(dir, i))}
        <br></br>
        Files :
        <ul>
          {dir.files.map((file, i) => (
            <li key={i}>{file.node.path}</li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {}, []);

  const [procstr, setProcstr] = useState("");
  const candidates = ["log", "success", "warn", "error", "system"];
  const addRandomNotif = () => {
    const num = Math.floor(Math.random() * 5);
    const candidate = candidates[num] as
      | "log"
      | "success"
      | "warn"
      | "error"
      | "system";
    JamOS.setNotif(
      `${candidate} notif. Random message : ${randomId()}`,
      candidate
    );
  };
  return (
    <Window {...props} proc={proc}>
      <div
        className="test-window"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button
          onClick={(e) => {
            addRandomNotif();
          }}
        >
          Add random notification
        </button>
      </div>
    </Window>
  );
}
