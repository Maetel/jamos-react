import axios from "axios";
import { useEffect, useRef, useState } from "react";
import ShimmerImage from "../components/ShimmerImage";
import Window from "../components/Window";
import JamOS, { WorldInfo } from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import styles from "../styles/WorldEditor.module.css";
import { InnerSignin } from "./JamHub";

export interface WorldEditorCoreProps {
  proc: Process;
}
export function WorldEditorCore(props: WorldEditorCoreProps) {
  const proc: Process = props.proc;
  const mode = JamOS.procmgr.getReadable(proc.id, "editorMode") ?? "select";
  useEffect(() => {
    JamOS.worldList(proc.id);
  }, []);
  const updateList = JamOS.procmgr.getReadable(proc.id, "updateList");
  useEffect(() => {
    console.log("updateList");
    JamOS.worldList(proc.id);
  }, [updateList]);
  const worldList: WorldInfo[] = JamOS.procmgr.getReadable(
    proc.id,
    "worldList"
  );
  const SelectWorld = (props) => {
    const colors = JamOS.theme.colors;

    const world = JamOS.worldReadable();
    const selected = (wid: string) => {
      return world.name === wid;
    };
    const buildItemStyle = (wid: string) => {
      const retval = {
        color: selected(wid) ? colors["2"] : colors["1"],
        backgroundColor: selected(wid) ? colors["1"] : colors["2"],
        boxShadow: colors.boxShadow,
      };

      return retval;
    };
    return (
      <div className={styles.selectWorldContainer}>
        <h3 className={styles.selectWorldTitle}>Select world</h3>
        {worldList && worldList.length > 0 ? (
          <ul className={styles.selectList}>
            {worldList.map((world, i) => (
              <li
                className={styles.selectItem}
                key={world.wid}
                style={buildItemStyle(world.wid)}
              >
                <h3 className={styles.itemTitle}>
                  {i + 1}. {world.wid}
                </h3>
                <span className={styles.itemDesc}>
                  by {world.uid}, created at{" "}
                  {new Date(world.created_time).toLocaleString()}
                </span>

                <div className={styles.itemSelect}>
                  <button
                    className={styles.selectButton}
                    onClick={(e) => {
                      JamOS.setWorld(world.wid);
                    }}
                  >
                    Select
                  </button>
                </div>
                <div className={styles.itemDelete}>
                  <button
                    className={styles.selectButton}
                    onClick={(e) => {
                      JamOS.procmgr.openTextModal(proc.id, {
                        title: `Delete world`,
                        descs: [
                          `Are you sure you want to delete world '${world.wid}'? Type ${world.wid} to confirm.`,
                        ],
                        buttons: ["Delete", "Cancel"],
                        callbacks: [
                          (input) => {
                            if (world.wid === input) {
                              JamOS.deleteWorld(world.wid);
                            } else {
                              JamOS.setNotif(
                                "Delete world failed. Input was not correct.",
                                "error"
                              );
                            }
                          },
                        ],
                      });
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.selectWorldNone}>Add a world to proceed!</div>
        )}
      </div>
    );
  };

  const CreateWorld = (props) => {
    const [wname, setWname] = useState("");
    const [msg, setMsg] = useState("Type world name to create");
    const onSubmit = (e) => {
      e.preventDefault();
      if (wname.length === 0) {
        return false;
      }
      JamOS.createWorld(wname, { calledByProc: proc.id });
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
          <button>Create</button>
        </form>
      </div>
    );
  };

  return (
    <div className={styles.coreContainer}>
      <div className={styles.btns}>
        <button
          className={styles.topBtn}
          onClick={(e) => {
            JamOS.toggle(proc.id, "updateList");
          }}
        >
          Refresh
        </button>
        <button
          className={styles.topBtn}
          onClick={(e) => {
            JamOS.set({ sampleInit: true });
          }}
        >
          Sample init
        </button>
        <button
          className={styles.topBtn}
          onClick={(e) => {
            JamOS.saveWorld();
          }}
        >
          Save world
        </button>
        <button
          className={styles.topBtn}
          onClick={(e) => {
            JamOS.loadWorld();
          }}
        >
          Load world
        </button>
      </div>

      <div className={styles.content}>
        <CreateWorld></CreateWorld>
        <SelectWorld></SelectWorld>
      </div>
    </div>
  );
}

export default function WorldEditor(props) {
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "World Editor";
  proc.disableMaxBtn = proc.disableMaxBtn ?? true;
  proc.rect = proc.rect ?? {
    width: 640,
    height: 480,
  };

  const jamUser = JamOS.userReadable();
  const signedIn = jamUser.signedin;
  const colors = JamOS.theme.colors;

  const signoutSize = 32;
  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Jam OS World Editor
          {signedIn && (
            <div
              className={styles.signout}
              style={{
                backgroundColor: "#dbdbdb",
                boxShadow: colors.boxShadow,
                width: signoutSize,
                height: signoutSize,
                borderRadius: signoutSize / 2,
              }}
              onClick={(e) => {
                //confirm signout
                JamOS.procmgr.openConfirm(
                  proc.id,
                  () => {
                    JamOS.signout();
                  },
                  {
                    title: "Sign out",
                    descs: [
                      "Do you wish to sign out?",
                      "All unsaved changes will be lost.",
                    ],
                    buttons: ["Sign out", "Cancel"],
                  }
                );
              }}
            >
              <ShimmerImage
                src={"/imgs/signout.svg"}
                alt={"Sign out button"}
                width={signoutSize * 0.7}
                height={signoutSize * 0.7}
                // layout="fill"
              ></ShimmerImage>
            </div>
          )}
        </h1>
        <div className={styles.body}>
          {signedIn ? (
            <WorldEditorCore proc={proc}></WorldEditorCore>
          ) : (
            <div
              className={styles.coverParent}
              style={{ backgroundColor: colors["2"] }}
            >
              <InnerSignin owner={proc.id}></InnerSignin>
            </div>
          )}
        </div>
      </div>
    </Window>
  );
}
