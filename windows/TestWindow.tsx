import { useAppDispatch, useAppSelector } from "../app/hooks";
import Window from "../components/Window";
import { mkdir, selectDirs, selectHome } from "../features/file/fileSlice";
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
  const addFile = (e) => {
    dispatch(mkdir("~/hi/ho"));
  };

  const DirView = (dir: Dir) => {
    return (
      <div style={{ marginLeft: 10 }} className="dir-container">
        * {dir.node.path} <br></br>
        Dirs :{dir.dirs.map((dir) => DirView(dir))}
        <br></br>
        Files :
        <ul>
          {dir.files.map((file) => (
            <li>{file.node.path}</li>
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
      </div>
    </Window>
  );
}
