import { useEffect, useState } from "react";
import { File } from "../features/file/FileTypes";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import styles from "../styles/Notepad.module.css";
import Path from "../scripts/Path";
import CallbackStore from "../features/JamOS/CallbackStore";

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
      .addToolbarItem(
        proc.id,
        "Notepad",
        "Open file directory",
        () => {
          const fp = JamOS.procmgr.getValue(proc.id, "filePath");
          const fv = JamOS.filemgr.fileValue(fp);
          if (fv && fv?.node.type === "text") {
            JamOS.procmgr.exeCmd(`finder ${new Path(fp).parent}`);
          }
        },
        { disabled: true }
      )
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

  useEffect(() => {
    if (fileOpened() && differs) {
      CallbackStore.register(`${proc.id}/onDestroy`, (killThisProc) => {
        JamOS.procmgr.openConfirm(
          proc.id,
          () => {
            const curTextAreaValue = JamOS.procmgr.getValue(
              proc.id,
              "textAreaValue"
            );
            JamOS.filemgr.updateFileData(filePath, "text", curTextAreaValue);
            killThisProc();
          },
          {
            title: "Quit Notepad?",
            descs: ["Save before close?"],
            buttons: ["Save & Quit", "Cancel"],
          }
        );
      });
    }
  }, [differs]);

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
      JamOS.procmgr
        .updateToolbarItem(proc.id, "Notepad", "Save", {
          disabled: false,
        })
        .updateToolbarItem(proc.id, "Notepad", "Open file directory", {
          disabled: false,
        });
    } else {
      JamOS.procmgr
        .updateToolbarItem(proc.id, "Notepad", "Save", {
          disabled: true,
        })
        .updateToolbarItem(proc.id, "Notepad", "Open file directory", {
          disabled: true,
        });
    }
  }, [filePath]);

  const handleKeyCombination = (e) => {
    //https://codewithhugo.com/detect-ctrl-click-js-react-vue/
    const isFront = JamOS.procmgr.isFrontValue(proc.id);
    if (!isFront) {
      return;
    }
    //combination
    const combination = (key: string) =>
      (e.metaKey || e.cmdKey) && e.key === key;
    if (combination("s")) {
      e.preventDefault();
      trySave();
    }
    if (combination("e")) {
      e.preventDefault();
      console.log("cmd e");
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyCombination);
    return () => {
      document.removeEventListener("keydown", handleKeyCombination);
    };
  }, []);

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
