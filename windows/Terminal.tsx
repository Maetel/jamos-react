import { useEffect, useState } from "react";
import Window from "../components/Window";
import styles from "../styles/Terminal.module.css";
import { randomId } from "../scripts/utils";
import PromptTextView from "../components/PromptTextView";
import Path from "../scripts/Path";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectDir, selectFile } from "../features/file/fileSlice";
import ProcMgr from "../features/procmgr/ProcMgr";
import { Provider } from "react-redux";
import store from "../app/store";
import React from "react";

const viewMap = {
  PromptTextView: PromptTextView,
};

interface PromptItem {
  id?: string;
  comp: string;
  data: {};
}

const procmgr = ProcMgr.getInstance();

export default function (props) {
  /////////// init setup
  let contElem: HTMLElement, inputArea: HTMLElement, inputElem: HTMLElement;
  let contElemId = randomId(),
    inputAreaId = randomId(),
    inputElemId = randomId();
  useEffect(() => {
    contElem = document.querySelector(`#${contElemId}`);
    inputArea = document.querySelector(`#${inputAreaId}`);
    inputElem = document.querySelector(`#${inputElemId}`);
  }, []);

  const [cmdUser, setCmdUser] = useState("jam@127.0.0.1");
  const [cmdValue, setCmdValue] = useState("");

  const dispatch = useAppDispatch();
  const findFile = (path) => useAppSelector(selectFile(path));
  const findDir = (path) => useAppSelector(selectDir(path));

  const pwd = new Path("~/");

  /////////// command history
  let cmdHistory = [];
  let cmdHistoryCursor = 0;
  const setNewCmdHistory = (cmd: string) => {
    cmdHistory.push(cmd);
    cmdHistoryCursor = cmdHistory.length;
  };

  /////////// Prompt view
  const [promptItems, setPromptItems] = useState([]);
  let itemId = 1;
  const lineElem = (): PromptItem => {
    return {
      comp: "PromptTextView",
      id: "" + itemId++,
      data: {
        isLine: true,
      },
    };
  };
  const _add = (item: PromptItem, addLine = true) => {
    item.id = "" + itemId++; //randomId();
    if (addLine) {
      setPromptItems([item, lineElem(), ...promptItems]);
      return;
    }
    setPromptItems([item, ...promptItems]);
  };
  const addText = (prom: string, line: boolean = true, type?: string) => {
    const data = {
      text: prom,
    };
    if (type) {
      data["colorType"] = type;
    }
    const textItem: PromptItem = {
      comp: "PromptTextView",
      data: data,
    };
    _add(textItem, line);
  };

  /////////// main handlers

  const handleFocus = (e) => {};
  const clearCommand = (e) => {
    e.preventDefault();
    setCmdValue("");
    cmdHistoryCursor = cmdHistory.length;
  };

  const handleTerminalCmd = async (cmds: string[]) => {
    const cmd = cmds.at(0);
    // if (!commands.TerminalCommandList.includes(cmd)) {
    //   addLog(`No terminal command : ${cmd} from handleTerminalCmd`);
    //   return;
    // }
    let dest: string;
    let merged = cmds.slice(1).join(" ").trim();
    let mergedFilePath = merged.startsWith("~/")
      ? new Path(merged)
      : Path.join(pwd.path, merged);
    let _pwd;

    if (cmd.startsWith("./")) {
      const app = Path.join(pwd.path, cmd.slice(2));
      if (findFile(app)) {
        procmgr.exeFile(app);
        addText("Execute " + app.last);
        return;
      }
    }
  };

  const handleKeydown = (e) => {
    const keyMap = {
      Enter: handleCommand,
      // Tab: autoComplete,
      // Escape: clearCommand,
      // ArrowDown: cmdHistoryDown,
      // ArrowUp: cmdHistoryUp,
    };
    keyMap[e.key]?.(e);
  };

  const handleCommand = (e) => {
    const toBeParsed: string = cmdValue.trim();

    clearCommand(e);

    const words = toBeParsed
      .split(" ")
      .map((word) => word.trim())
      .filter((word) => word !== " " && word !== "");

    if (!words.length) {
      //no input commands
      addText(" ");
      return;
    }

    setNewCmdHistory(toBeParsed);

    // const cmd = words.at(0);
    // if (!commands.validateCommand(cmd)) {
    //   addError(`Invalid command : ${cmd}`);
    //   return;
    // }

    handleTerminalCmd(words);
    // addText("Command : " + words.join(" "));
    addText(words.join(" "));
  };

  return (
    <Window {...props}>
      <div
        className={`${styles.container}`}
        onMouseUp={handleFocus}
        id={contElemId}
      >
        <div className={`${styles.inputArea}`} id={inputAreaId}>
          <span className={`${styles.inputLabel}`}>{cmdUser}</span>
          <span className={`${styles.inputBoxWrapper}`}>
            <textarea
              spellCheck={false}
              rows={1}
              className={`${styles.inputBox}`}
              id={inputElemId}
              value={cmdValue}
              onChange={(e) => {
                setCmdValue(e.target.value);
                console.log("setcmdvalue, cmdavlue:", cmdValue);
              }}
              onKeyDown={handleKeydown}
            />
          </span>
        </div>
        <div className={`${styles.separator}`} />
        {promptItems.map((item, i) => {
          return (
            <Provider store={store} key={i}>
              {React.createElement(viewMap[item.comp], {
                ...item,
              })}
            </Provider>
          );
        })}

        {/* {#each $promptItems as item (item.id)}
      <!-- <div className="prompt-result">> {prompt}</div> -->
      <svelte:component this={viewMap[item.comp]} {...item.data} />
    {/each} */}
      </div>
    </Window>
  );
}
