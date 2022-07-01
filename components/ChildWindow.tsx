import Window from "./Window";
import Process from "../features/procmgr/ProcTypes";

export default function ChildWindow(props) {
  const proc: Process = { ...props.proc };
  proc.disableMaxBtn = proc.disableMaxBtn ?? true;
  proc.disableMinBtn = proc.disableMinBtn ?? true;
  proc.resize = proc.resize ?? "none";
  proc.rect = proc.rect ?? {
    // top: "25%",
    // left: "25%",
    width: "50%",
    height: "50%",
  };

  return (
    <Window {...props} proc={proc}>
      {props.children}
    </Window>
  );
}
