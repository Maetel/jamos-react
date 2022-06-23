import { useAppSelector } from "../app/hooks";
import Window from "../components/Window";
import { selectLogAll, selectLogSystem } from "../features/log/logSlice";
import ProcMgr from "../features/procmgr/ProcMgr";
import { selectProcesses } from "../features/procmgr/procSlice";
import Process from "../features/procmgr/ProcTypes";

import styles from "../styles/Logger.module.css";

export default function Logger(props) {
  const proc: Process = { ...props.proc };
  proc.name = proc.name || "Logger";
  const logs = [...useAppSelector(selectLogAll)].reverse();

  const procs = useAppSelector(selectProcesses);
  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <div className={styles.flex1}>
          * Logs
          <ul className="logs">
            {logs.map((_, i) => (
              <li className="log" key={i}>
                [{_.type}]{_.content}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Window>
  );
}
