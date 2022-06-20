import { useState } from "react";
import Window from "../components/Window";
import styles from "../styles/Notepad.module.css";

export default function Notepad(props) {
  const setFile = (e) => {};
  const loadFile = (e) => {};
  const saveFile = (e) => {};
  const updateValue = (e) => {};

  const [textAreaValue, setTextAreaValue] = useState("");

  return (
    <Window {...props}>
      <div className={styles.container}>
        <div className={styles.btns}>
          <button title="Reload" className={styles.btn} onClick={setFile}>
            &#8634;
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
