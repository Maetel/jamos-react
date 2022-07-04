import Process from "../features/procmgr/ProcTypes";
import Window from "./Window";

export default function Daemon(props) {
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "Daemon Process";
  proc.rect = proc.rect ?? {
    top: "0px",
    left: "0px",
    width: 0,
    height: 0,
    minWidth: 0,
    minHeight: 0,
  };
  return <Window {...props} proc={proc}></Window>;
}
