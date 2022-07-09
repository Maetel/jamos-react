import { useEffect, useState } from "react";
import { File } from "../features/file/FileTypes";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import styles from "../styles/Notepad.module.css";
import { ToolbarControl } from "../grounds/Toolbar";
import Path from "../scripts/Path";

export default function Notepad(props) {
  const filemgr = JamOS.filemgr;
  const proc: Process = { ...props.proc };
  proc.name = proc.name || "Notepad";
  proc.resize = proc.resize ?? "both";

  const filePath = JamOS.procmgr.getReadable(proc.id, "filePath");
  const setFilePath = (path: string) => {
    JamOS.procmgr.set(proc.id, { filePath: path });
  };
  const textAreaValue = JamOS.procmgr.getReadable(proc.id, "textAreaValue");
  const setTextAreaValue = (val: string) => {
    JamOS.procmgr.set(proc.id, { textAreaValue: val });
  };

  const setFile = (e) => {};
  const loadFile = (e) => {
    //test
    interface FileModalProps {
      hint?: string; //file or dir path, okay to be undefined
      type?: string; // ex) 'dir', 'text', ...
      extension?: string; // '.txt', '.jpg', ... , regardless of case
    }
    const fileProps: FileModalProps = undefined;
    // JamOS.openFileModal(fileProps);
    console.warn("Todo : update loadFile() with modal");
    setFilePath("~/Sample text1.txt");
  };
  const saveFile = (e) => {
    if (filePath.length) {
      console.log("Save file @" + filePath + ", :", textAreaValue);
      JamOS.procmgr.openConfirmSave(proc.id, () => {
        filemgr.updateFileData(filePath, "text", textAreaValue);
      });
    } else {
      console.error("Filepath not designated path:", filePath);
    }
  };

  const onLoadDialogue = (params) => {
    if (!params) {
      return;
    }
    if (typeof params === "string") {
      params = params.trim();
      const f = filemgr.fileValue(params);
      if (f && f.node.type === "text") {
        setFilePath(params);
      } else {
        JamOS.setNotif(`'${params}' is not a text file.`, "error");
      }
    }
  };
  const onSaveDialogue = (params) => {
    if (!params) {
      return;
    }
    if (typeof params !== "string") {
      return;
    }
    params = params.trim();
    const filePath = JamOS.procmgr.getValue(proc.id, "filePath");
    const textAreaValue = JamOS.procmgr.getValue(proc.id, "textAreaValue");
    console.log(
      `filePath:${filePath}, params:${params}, filePath === params : ${
        filePath === params
      }`
    );
    if (filePath === params) {
      //overwrite self. don't ask
      JamOS.filemgr.updateFileData(params, "text", textAreaValue);
      return;
    }
    const f = filemgr.fileValue(params);
    if (f) {
      JamOS.setNotif(`'${params}' already exists.`, "warn");
      JamOS.procmgr.openConfirm(
        proc.id,
        () => {
          //on save
          console.log(`saving to ${params} => ${textAreaValue}`);
          JamOS.filemgr.updateFileData(params, "text", textAreaValue);
        },
        { buttons: ["Overwrite", "Cancel"] }
      );
    } else {
      console.log("textAreaValue:", textAreaValue);
      const f = JamOS.filemgr.makeFile(params, "text", {
        data: { text: textAreaValue },
      });
      JamOS.filemgr.addFile(f);
    }
  };

  useEffect(() => {
    ToolbarControl.RegisterBuilder(proc.id)
      .register("Notepad", "Open", () => {
        JamOS.procmgr.openFileDialogue(proc.id, "Load", {
          name: "Open text file",
          includes: ["text"],
          onOkay: onLoadDialogue,
        });
      })
      .register("Notepad", "Save", () => {
        const fp = JamOS.procmgr.getValue(proc.id, "filePath");
        if (JamOS.filemgr.fileExists(fp)) {
          const val = JamOS.procmgr.getValue(proc.id, "textAreaValue") ?? "";
          JamOS.filemgr.updateFileData(fp, "text", val);
        }
      })
      .register(
        "Notepad",
        "Save As",
        () => {
          JamOS.procmgr.openFileDialogue(proc.id, "Save", {
            name: "Save as",
            includes: ["text"],
            onOkay: onSaveDialogue,
          });
        },
        { separator: true }
      );
  }, []);

  useEffect(() => {
    if (proc.node) {
      setFilePath(proc.node.path);
    }
    setTextAreaValue(proc.text ?? "");
  }, []);
  useEffect(() => {
    const f: File = filemgr.fileValue(filePath);
    // console.log("f?.data['text']:", f?.data["text"]);
    if (f) {
      setTextAreaValue(f?.data["text"] ?? "");
      JamOS.procmgr.set(proc.id, {
        name: `Notepad - ${new Path(filePath).last}`,
      });
    }
  }, [filePath]);

  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <div className={styles.btns} style={{ display: "none" }}>
          <button title="Reload" className={styles.btn} onClick={setFile}>
            &darr;
          </button>
          <button title="Reload" className={styles.btn} onClick={loadFile}>
            &#8634;
          </button>
          <button title="Save" className={styles.btn} onClick={saveFile}>
            &darr;
          </button>
        </div>
        <div
          className={styles.notepadAlert}
          // bind:this={alertElem}
          onClick={() => {
            // alertElem.classList.remove("active");
          }}
        >
          {/* {alertContent} */}
        </div>
        <textarea
          spellCheck={false}
          className={styles.textArea}
          // bind:this={textAreaElem}
          // bind:value={textAreaValue}
          value={textAreaValue}
          onChange={(e) => {
            setTextAreaValue(e.target.value);
          }}
        />
      </div>
    </Window>
  );
}
