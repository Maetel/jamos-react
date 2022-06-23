import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import Window from "../components/Window";
import FileMgr from "../features/file/FileMgr";
import {
  mkdir,
  selectDir,
  selectDirs,
  selectFile,
  selectHome,
} from "../features/file/fileSlice";
import { Dir } from "../features/file/FileTypes";
import Log from "../features/log/Log";
import { selectLogAll, selectLogSystem } from "../features/log/logSlice";
import ProcMgr from "../features/procmgr/ProcMgr";
import Process from "../features/procmgr/ProcTypes";

export default function TestWindow(props) {
  const procmgr = ProcMgr.getInstance();
  const filemgr = FileMgr.getInstance();
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "Test Window";
  const logs = useAppSelector(selectLogAll);
  const system = useAppSelector(selectLogSystem);
  const home = useAppSelector(selectHome);
  const dirs = useAppSelector(selectDirs);
  const dir = useAppSelector(selectDir("~/hi/ho"));
  // const f = useAppSelector(selectFile("f"));

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
      </div>
    </Window>
  );
}
