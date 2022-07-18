import { useEffect, useState } from "react";
import { File } from "../features/file/FileTypes";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import styles from "../styles/Notepad.module.css";
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
          JamOS.procmgr.set(proc.id, { filePath: params });
        },
        { buttons: ["Overwrite", "Cancel"] }
      );
    } else {
      console.log("textAreaValue:", textAreaValue);
      const f = JamOS.filemgr.makeFile(params, "text", {
        data: { text: textAreaValue },
      });
      JamOS.filemgr.addFile(f);
      JamOS.procmgr.set(proc.id, { filePath: params });
    }
  };

  const trySaveAs = () => {
    JamOS.procmgr.openFileDialogue(proc.id, "Save", {
      name: "Save as",
      includes: ["text"],
      onOkay: onSaveDialogue,
    });
  };
  const trySave = () => {
    const fp = JamOS.procmgr.getValue(proc.id, "filePath");
    const fv = JamOS.filemgr.fileValue(fp);
    if (fv && fv?.node.type === "text") {
      const val = JamOS.procmgr.getValue(proc.id, "textAreaValue") ?? "";
      JamOS.filemgr.updateFileData(fp, "text", val);
    } else {
      trySaveAs();
    }
  };
  useEffect(() => {
    JamOS.procmgr
      .addToolbarItem(proc.id, "Notepad", "Open", () => {
        JamOS.procmgr.openFileDialogue(proc.id, "Load", {
          name: "Open text file",
          includes: ["text"],
          onOkay: onLoadDialogue,
        });
      })
      .addToolbarItem(proc.id, "Notepad", "Save", trySave, { disabled: true })
      .addToolbarItem(proc.id, "Notepad", "Save As", trySaveAs, {
        separator: true,
      });
  }, []);

  useEffect(() => {
    if (proc.node) {
      setFilePath(proc.node.path);
    }
    setTextAreaValue(proc.text ?? "");
  }, []);

  const differs =
    filemgr.fileReadable(filePath)?.data?.["text"] !== textAreaValue;

  const fileOpened = () => {
    const fp = JamOS.procmgr.getValue(proc.id, "filePath");
    const fv = filemgr.fileValue(fp);
    return fv && fv?.node.type === "text";
  };
  const buildName = fileOpened()
    ? `Notepad - ${new Path(filePath).last}${differs ? " (edited)" : ""}`
    : "Notepad";
  useEffect(() => {
    const f: File = filemgr.fileValue(filePath);
    // console.log("f?.data['text']:", f?.data["text"]);
    if (f && f?.node.type === "text") {
      setTextAreaValue(f?.data?.["text"] ?? "");
      JamOS.procmgr.set(proc.id, {
        name: buildName,
      });
      JamOS.procmgr.updateToolbarItem(proc.id, "Notepad", "Save", {
        disabled: false,
      });
    } else {
      JamOS.procmgr.updateToolbarItem(proc.id, "Notepad", "Save", {
        disabled: true,
      });
    }
  }, [filePath]);

  const isFront = JamOS.procmgr.isFront(proc.id);
  const handleCmdS = (e) => {
    //https://codewithhugo.com/detect-ctrl-click-js-react-vue/
    if (!isFront) {
      return;
    }
    if ((e.metaKey || e.cmdKey) && e.key === "s") {
      e.preventDefault();
      trySave();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleCmdS);
  }, [isFront]);

  useEffect(() => {
    JamOS.procmgr.set(proc.id, {
      name: buildName,
    });
    JamOS.procmgr.set(proc.id, {
      desc:
        buildName === "Notepad"
          ? "Notepad"
          : buildName.replace("Notepad - ", ""),
    });
  }, [buildName]);

  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
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
