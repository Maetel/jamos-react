import Window from "../components/Window";
import Process from "../features/procmgr/ProcTypes";

export default function TestWindow(props) {
  return (
    <Window {...props}>
      <div className="test-window">
        This is a test window of id : {props.proc.id}
      </div>
    </Window>
  );
}
