import Window from "../components/Window";
import Process from "../features/procmgr/ProcTypes";

export default function TestWindow(props) {
  const proc: Process = props.proc;
  return (
    <Window {...props}>
      <div className="test-window">
        This is a test window of id : {proc.id} <br></br>
        Index : {proc.zIndex};
      </div>
    </Window>
  );
}
