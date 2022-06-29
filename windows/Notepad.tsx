import { useEffect, useState } from "react";
import { File } from "../features/file/FileTypes";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import styles from "../styles/Notepad.module.css";

export default function Notepad(props) {
  const filemgr = JamOS.filemgr();
  const proc: Process = { ...props.proc };
  proc.name = proc.name || "Notepad";
  const [filePath, setFilePath] = useState("");
  const [textAreaValue, setTextAreaValue] = useState("");
  const setFile = (e) => {};
  const loadFile = (e) => {
    //text
    setFilePath("~/Sample text.txt");
  };
  const saveFile = (e) => {};
  useEffect(() => {
    // for (let key in proc) {
    //   console.log(`Proc[${key}] = ${proc[key]}`);
    // }
    // setTextAreaValue(proc["text"]);
    console.log("Proc.text:", proc.text);
    setTextAreaValue(proc.text);
  }, []);
  useEffect(() => {
    console.log("textAreaValue:", textAreaValue);
  }, [textAreaValue]);
  useEffect(() => {
    const f: File = filemgr.fileValue(filePath);
    // console.log("f?.data['text']:", f?.data["text"]);
    if (f) {
      setTextAreaValue(f?.data["text"] ?? "");
    }
  }, [filePath]);

  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <div className={styles.btns}>
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
