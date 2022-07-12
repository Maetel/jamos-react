import Window from "../components/Window";
import Process from "../features/procmgr/ProcTypes";
// import styles from "../styles/";

export default function _(props) {
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "";
  return (
    <Window {...props} proc={proc}>
      {/* <div className={styles.container}>dd</div> */}
    </Window>
  );
}
