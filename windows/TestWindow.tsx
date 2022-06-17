import { useAppDispatch, useAppSelector } from "../app/hooks";
import Window from "../components/Window";
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
import Process from "../features/procmgr/ProcTypes";

export default function TestWindow(props) {
  const proc: Process = props.proc;
  const dispatch = useAppDispatch();
  const logs = useAppSelector(selectLogAll);
  const system = useAppSelector(selectLogSystem);
  const home = useAppSelector(selectHome);
  const dirs = useAppSelector(selectDirs);
  const dir = useAppSelector(selectDir("~/hi/ho"));
  // const f = useAppSelector(selectFile("f"));
  const addFile = (e) => {
    dispatch(mkdir("~/hi/ho"));
    Log.obj(dirs, "Dirs");
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

  return (
    <Window {...props}>
      <div className="test-window">
        This is a test window of id : {proc.id} <br></br>
        Index : {proc.zIndex}; log :{" "}
        <button className="addfile" onClick={addFile}>
          add file
        </button>
        Dirs: <br></br>
        {DirView(home)}
        <br></br>
        select dir : <br></br>
        {JSON.stringify(dir)}
      </div>
    </Window>
  );
}
