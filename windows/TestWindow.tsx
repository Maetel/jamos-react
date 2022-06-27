import { useEffect, useState } from "react";
import Window from "../components/Window";
import { Dir } from "../features/file/FileTypes";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";

export default function TestWindow(props) {
  const procmgr = JamOS.procmgr();
  const filemgr = JamOS.filemgr();
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "Test Window";

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

  return (
    <Window {...props} proc={proc}>
      <div className="test-window">
        <button
          onClick={() => {
            procmgr.killAll();
          }}
        >
          killall
        </button>
        <div className="saveProc">
          <button
            onClick={() => {
              // setProcstr(procmgr.stringify());
              setProcstr(JamOS.stringify());
            }}
          >
            Save
          </button>
          <br></br>Stringify : {procstr}
        </div>
        <button
          onClick={() => {
            if (procstr === "") {
              return;
            }
            // procmgr.loadFromString(procstr);
            JamOS.loadFromString(procstr);
          }}
        >
          Load
        </button>
      </div>
    </Window>
  );
}
