import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import styles from "../styles/WorldEditor.module.css";
import { InnerSignin } from "./JamHub";

interface WorldInfo {
  uid: string;
  wid: string;
  rights: string;
  created_time: string;
  last_update_time: string;
}
const tryFetchWorlds = async (procId: string) => {
  const res = await axios
    .get(JamOS.apis.worldList, JamOS.authHeader)
    .then((res) => {
      console.log("res:", res);
      const worldList: WorldInfo[] = res.data?.content?.map((datum) => ({
        uid: datum.uid,
        wid: datum.wid,
        rights: datum.wid,
        created_time: datum.created_time,
        last_update_time: datum.last_update_time,
      }));
      JamOS.procmgr.set(procId, { worldList: worldList });
    })
    .catch((err) => {
      console.error(err);
    });
};

export interface WorldEditorCoreProps {
  proc: Process;
}
export function WorldEditorCore(props: WorldEditorCoreProps) {
  const proc: Process = props.proc;
  const jamUser = JamOS.userReadable();
  const signedIn = jamUser.signedin;
  type EditMode = "select" | "create" | "edit";
  const mode = JamOS.procmgr.getReadable(proc.id, "editorMode") ?? "select";
  const setMode = (mode: string) => {
    JamOS.procmgr.set(proc.id, { editorMode: mode });
  };
  useEffect(() => {
    tryFetchWorlds(proc.id);
  }, []);
  useEffect(() => {
    console.log("mode:", mode);
    switch (mode) {
      case "select":
        tryFetchWorlds(proc.id);
        break;
      case "create":
        //
        break;
      case "edit":
        //
        break;
      default:
        break;
    }
  }, [mode]);

  const SelectWorld = (props) => {
    const colors = JamOS.theme.colors;
    const worldList: WorldInfo[] = JamOS.procmgr.getReadable(
      proc.id,
      "worldList"
    );
    const world = JamOS.worldReadable();
    const selected = (wid: string) => {
      return world.name === wid;
    };
    return (
      <div className={styles.selectWorldContainer}>
        <ul>
          {worldList?.map((world) => (
            <li
              key={world.wid}
              onClick={(e) => {
                JamOS.setWorld(world.wid);
              }}
              style={{
                color: selected(world.wid) ? colors["2"] : colors["1"],
                backgroundColor: selected(world.wid)
                  ? colors["1"]
                  : colors["2"],
                cursor: "pointer",
              }}
            >
              {world.wid} by {world.uid}, created at{" "}
              {new Date(world.created_time).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const CreateWorld = (props) => {
    const [wname, setWname] = useState("");
    const [msg, setMsg] = useState("Type world name");
    const onSubmit = (e) => {
      e.preventDefault();
      console.log("onSubmit");
      if (wname.length === 0) {
        return false;
      }
      axios
        .post(JamOS.apis.worldCreate, { wid: wname }, JamOS.authHeader)
        .then((res) => {
          console.log("res:", res);
          const cont = res.data;
          if (cont) {
            setMsg(`Successfully created world ${cont.wid} for ${cont.uid}`);
          } else {
            setMsg("Successfully created world");
          }
          JamOS.format();
          JamOS.setWorld(wname);
          JamOS.procmgr.killAll("system");
          JamOS.procmgr.add("appstore");
          return true;
        })
        .catch((err) => {
          console.error(err);
          const cont = err.response?.data?.content;
          if (cont) {
            setMsg(cont);
          } else {
            setMsg("Unknown error occured. Please try again.");
          }
          return false;
        });
      return false;
    };
    return (
      <div className={styles.createWorldContainer}>
        <p className={styles.instruction}>{msg}</p>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="wid"
            placeholder="World name"
            value={wname}
            onChange={(e) => {
              setWname(e.target.value);
            }}
          ></input>
          <button>Submit</button>
        </form>
      </div>
    );
  };

  return (
    <div className={styles.coreContainer}>
      <div className={styles.btns}>
        <button
          onClick={(e) => {
            setMode("select");
          }}
        >
          Select world
        </button>
        <button
          onClick={(e) => {
            setMode("create");
          }}
        >
          Create world
        </button>
        <button
          onClick={(e) => {
            JamOS.saveWorld();
          }}
        >
          Save world
        </button>
        <button
          onClick={(e) => {
            JamOS.loadWorld();
          }}
        >
          Load world
        </button>
        <button
          onClick={(e) => {
            console.log('JamOS.toggle("system", "saveWorldLocal")');
            JamOS.toggle("system", "saveWorldLocal");
          }}
        >
          Save world
        </button>
        <button
          onClick={(e) => {
            console.log('JamOS.toggle("system", "loadWorldLocal")');
            JamOS.toggle("system", "loadWorldLocal");
          }}
        >
          Load world
        </button>
      </div>

      <div className={styles.content}>
        {mode === "select" ? (
          <SelectWorld></SelectWorld>
        ) : (
          <CreateWorld></CreateWorld>
        )}
      </div>
    </div>
  );
}

export default function WorldEditor(props) {
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "World Editor";
  proc.disableMaxBtn = proc.disableMaxBtn ?? true;

  const jamUser = JamOS.userReadable();
  const signedIn = jamUser.signedin;
  const colors = JamOS.theme.colors;

  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <h1 className={styles.title}>Jam OS World Editor</h1>
        <div className={styles.body}>
          {signedIn ? (
            <WorldEditorCore proc={proc}></WorldEditorCore>
          ) : (
            <div
              className={styles.coverParent}
              style={{ backgroundColor: colors["2"] }}
            >
              <InnerSignin></InnerSignin>
            </div>
          )}
        </div>
      </div>
    </Window>
  );
}
