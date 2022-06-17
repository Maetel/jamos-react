import { useAppDispatch, useAppSelector } from "../app/hooks";
import Window from "../components/Window";
import { mkdir, selectDirs, selectHome } from "../features/file/fileSlice";
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
    Log.obj(home);
    Log.obj(dirs);
    dispatch(mkdir("~/hi/ho"));
    // Log.obj(home);
    // Log.obj(dirs);
  };

  return (
    <Window {...props}>
      <div className="test-window">
        This is a test window of id : {proc.id} <br></br>
        Index : {proc.zIndex}; log :{" "}
        <button className="addfile" onClick={addFile}>
          add file
        </button>
      </div>
    </Window>
  );
}
