import { useAppSelector } from "../app/hooks";
import Window from "../components/Window";
import { selectLogAll, selectLogSystem } from "../features/log/logSlice";
import Process from "../features/procmgr/ProcTypes";

export default function TestWindow(props) {
  const proc: Process = props.proc;
  const logs = useAppSelector(selectLogAll);
  const system = useAppSelector(selectLogSystem);
  return (
    <Window {...props}>
      <div className="test-window">
        This is a test window of id : {proc.id} <br></br>
        Index : {proc.zIndex}; log :{" "}
      </div>
    </Window>
  );
}
