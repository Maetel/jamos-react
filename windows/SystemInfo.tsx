import { useRef, useState } from "react";
import PromptTableView, { TableData } from "../components/PromptTableView";
import Window from "../components/Window";
import CallbackStore from "../features/JamOS/CallbackStore";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";

import styles from "../styles/SystemInfo.module.css";

export default function SystemInfo(props) {
  const procmgr = JamOS.procmgr;
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "System Info";
  const colors = JamOS.theme.colors;

  const procs = procmgr.procs;

  const [isOpen, setIsOpen] = useState({});

  const CollapsibleProc = (props) => {
    const proc = props.proc;

    const contentElem = useRef(null);
    const toggleCollapse = (e) => {
      const elem: HTMLElement = contentElem.current;
      setIsOpen((open) => {
        const retval = { ...open };
        // debugger;
        if (open[proc.id] === undefined) {
          retval[proc.id] = true; //first clicked
        } else {
          retval[proc.id] = !retval[proc.id];
        }
        // elem.style.setProperty(
        //   "display",
        //   retval[proc.id] === true ? "block" : "none"
        // );
        return retval;
      });
    };
    const rows = [];
    for (let key in proc) {
      const serialized = ["string", "number", "boolean"].includes(
        typeof proc[key]
      )
        ? "" + proc[key]
        : JSON.stringify(proc[key]);
      rows.push([key, serialized]);
    }
    const tableData: TableData = {
      title: proc.comp,
      desc: `${proc.comp} of id ${proc.id}`,
      heads: ["Property", "Value"],
      rows: rows,
      weights: [1, 4],
    };
    return (
      <div
        className={styles.collapsibleWrapper}
        style={{
          color: colors["2"],
          backgroundColor: colors["1"],
        }}
      >
        <div className={styles.clickable} onClick={toggleCollapse}>
          {proc.name !== "Application" ? proc.name : proc.type}
        </div>
        <div
          className={styles.content}
          ref={contentElem}
          style={{
            color: colors["1"],
            backgroundColor: colors["2"],
            display: isOpen[proc.id] === true ? "block" : "none",
          }}
        >
          <PromptTableView tableData={tableData} id={proc.id}></PromptTableView>
        </div>
      </div>
    );
  };

  const CallbacksList = (props) => {
    const rows = [];
    console.log("CallbackStore.callbacks:", CallbackStore.callbacks);
    for (let key in CallbackStore.callbacks) {
      rows.push([key, CallbackStore.callbacks[key].toString()]);
    }
    if (rows.length === 0) {
      rows.push(["No callback found", "No callback found"]);
    }
    const tableData: TableData = {
      desc: `CallbackStore.callbacks`,
      heads: ["Callback name", "Function"],
      rows: rows,
      weights: [1, 4],
    };
    return <PromptTableView tableData={tableData}></PromptTableView>;
  };

  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <div className={`${styles.flex1}`}>
          <div className={styles.overall}>
            <h1>Overall</h1>
            <ul>
              <li>
                Currently running{" "}
                {`${procmgr.procs.length} ${
                  procmgr.procs.length > 1 ? "processes" : "process"
                }`}
              </li>
              <li>
                <CallbacksList></CallbacksList>
              </li>
            </ul>
          </div>

          {procs.map((proc, i) => {
            return <CollapsibleProc proc={proc} key={i}></CollapsibleProc>;
          })}
        </div>
      </div>
    </Window>
  );
}
