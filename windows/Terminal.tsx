import { useEffect, useState } from "react";
import Window from "../components/Window";
import styles from "../styles/Terminal.module.css";
import { clamp, randomId } from "../scripts/utils";
import PromptTextView from "../components/PromptTextView";
import Path from "../scripts/Path";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  bfsDir,
  dirExists,
  fileExists,
  mkdir,
  selectDir,
  selectFile,
} from "../features/file/fileSlice";
import ProcMgr from "../features/procmgr/ProcMgr";
import { Provider } from "react-redux";
import store from "../app/store";
import React from "react";
import PromptTableView, { TableData } from "../components/PromptTableView";
import {
  killProc,
  setProcProps,
  toggleMaximize,
} from "../features/procmgr/procSlice";

const viewMap = {
  PromptTextView: PromptTextView,
  PromptTableView: PromptTableView,
  // PromptGridView: PromptGridView,
};

interface PromptItem {
  id?: string;
  comp: string;
  data: {};
}

const procmgr = ProcMgr.getInstance();

export default function (props) {
  const proc = props.proc;
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

  const [username, setUsername] = useState("jam@127.0.0.1");
  const [cmdValue, setCmdValue] = useState("");

  const dispatch = useAppDispatch();
  // const findFile = (path: string) => useAppSelector(selectFile(path));
  // const findDir = (path: string) => useAppSelector(selectDir(path));

  const pwd = new Path("~/");

  /////////// command history
  const [cmdHistory, setCmdHistory] = useState({ hist: [], cursor: 0 });
  const getCmdValue = (cursor) => cmdHistory.hist.at(cursor) || "";
  const getCmdCursor = () => cmdHistory.cursor;
  const setNewCmdHistory = (cmd: string) => {
    setCmdHistory((cmds) => ({
      hist: [...cmds.hist, cmd],
      cursor: cmds.hist.length + 1,
    }));
  };
  const cmdHistoryUp = (e) => {
    e.preventDefault();

    const cursor = clamp(cmdHistory.cursor - 1, 0, cmdHistory.hist.length);
    setCmdValue(getCmdValue(cursor));
    setCmdHistory((cmds) => ({
      hist: cmds.hist,
      cursor: cursor,
    }));
  };
  const cmdHistoryDown = (e) => {
    e.preventDefault();
    const cursor = clamp(cmdHistory.cursor + 1, 0, cmdHistory.hist.length);
    setCmdValue(getCmdValue(cursor));
    setCmdHistory((cmds) => ({
      hist: cmds.hist,
      cursor: cursor,
    }));
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
  const addLine = () => {
    _add(lineElem());
  };
  const _add = (item: PromptItem) => {
    item.id = "" + itemId++; //randomId();
    setPromptItems((promptItems) => [item, ...promptItems]);
    // console.log("_add, item :", item);
  };
  const addWarn = (prom: string) => {
    addText(prom, "warn");
  };
  const addError = (prom: string) => {
    addText(prom, "error");
  };

  const addSuccess = (prom: string) => {
    addText(prom, "okay");
  };
  const addText = (prom: string, type?: string) => {
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

    _add(textItem);
  };
  const addHelp = () => {
    const titleAndApps: TableData = {
      title: "JamOS Terminal Commands",
      desc: `- Applications, [optional] <required>`,
      heads: ["App Name", "Description"],
      rows: [
        ["about", "About JamOS🍞"],
        ["bakery", "Let's begin from here"],
        ["terminal", "CLI interface that can control JamOS"],
        ["finder [$path]", "displays and interacts with directories and files"],
        ["notepad [$path]", "easy and simple text editor"],
        ["markdown [$path]", "markdown editor and viewer"],
        ["browser [$url]", "JamBrowser"],
        ["broom", "close all process"],
        ["settings", "open user settings"],
        ["styler", "JamOS Styler"],
        ["atelier", "Interactive canvas with generative art"],
      ],
    };
    const terminalCmds: TableData = {
      desc: "- Terminal Commands",
      heads: ["Command Name", "Description"],
      rows: [
        ["ls [$path]", "list all directories and files"],
        ["cd <$path>", "goes to the path"],
        ["mkdir <$path>", "makes directories recursively to the path"],
        [
          "touch <$path>",
          "makes a file in text mode and creates directories to the file",
        ],
        ["cat <$path>", "reads a text file"],
        ["rm <$path>", "removes a file"],
        ["rmdir <$path>", "removes a directory recursively"],
        ["clear", "clears prompt"],
        ["get <$url>", "sends get request to url"],
        ["whoami", "shows your username"],
        ["maximize", "toggle window maximize"],
        ["quit, exit", "quits this terminal"],
        ["ps", "process list"],
      ],
    };

    const systemCmds: TableData = {
      desc: `- System commands, or dev/beta apps`,
      heads: ["App Name", "Description"],
      rows: [
        ["savebread", "save current status"],
        ["loadbread", "load saved"],
        ["resetbread", "reset all data and settings and reboot"],
        ["get <$url>", "<DEV> send get request and display response"],
        ["postman", "<DEV> send request and receive response"],
        [
          "logger",
          "<DEV>A logger watches over the whole OS and displays changes",
        ],
        [
          "hub",
          "<To be updated> where you can create and share your bread with your friends.",
        ],
        ["mv <$path:from> <$path:to>", "<To be updated>moves a file"],
        ["cp <$path:from> <$path:to>", "<To be updated>copies a file"],
      ],
    };

    titleAndApps.rows.sort();
    terminalCmds.rows.sort();

    const appItem: PromptItem = {
      comp: "PromptTableView",
      data: { tableData: titleAndApps },
    };
    const terminalItem: PromptItem = {
      comp: "PromptTableView",
      data: { tableData: terminalCmds },
    };
    const systemCmdItem: PromptItem = {
      comp: "PromptTableView",
      data: { tableData: systemCmds },
    };
    addLine();
    addText(" End of help");
    _add(systemCmdItem);
    addText(" ");
    _add(terminalItem);
    addText(" ");
    _add(appItem);
  };

  /////////// main handlers

  const handleFocus = (e) => {};
  const clearCommand = (e) => {
    e.preventDefault();
    setCmdValue("");
    setCmdHistory((cmds) => ({ hist: cmds.hist, cursor: cmds.hist.length }));
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
      if (fileExists(app.path)) {
        procmgr.exeFile(app);
        addText("Execute " + app.last);
        return;
      }
    }
    switch (cmd) {
      case "atelier":
      case "postman":
      case "terminal":
      case "logger":
      case "markdown":
      case "bakery":
      case "broom":
      case "about":
      case "styler":
      case "settings":
        procmgr.add(cmd);
        break;
      case "notepad":
        if (merged.length === 0) {
          procmgr.add("notepad");
        } else {
          console.log(merged);
          procmgr.add("notepad", { path: mergedFilePath.path });
        }
        break;
      case "viewer":
        if (merged.length === 0) {
          addWarn("Path required for image viewer.");
          break;
        }

        procmgr.add("viewer", { path: mergedFilePath.path });
        break;
      case "cp":
      case "mv":
        addWarn("To be updated soon");
        break;

      case "mkdir":
        if (!merged) {
          addWarn("Path required");
          return;
        }
        if (dirExists(mergedFilePath.path)) {
          addWarn(`Directory '${mergedFilePath.path}' already exists`);
          break;
        }
        dispatch(mkdir(mergedFilePath.path));
        if (!dirExists(mergedFilePath.path)) {
          // if (!findDir(mergedFilePath.path)) {
          addError(`Failed to make directory at ${merged}`);
          break;
        }
        addSuccess(`Successfully made directory at ${merged}`);
        break;

      // case "get":
      //   dest = merged;
      //   if (!dest || dest.length === 0) {
      //     addWarn("Path required for get request");
      //     return;
      //   }
      //   addText("Get request to " + dest);
      //   const res = await axios
      //     .get(dest)
      //     .then((response) => response.data)
      //     .catch((err) => {
      //       console.log(err);
      //       addError(err);
      //       return;
      //     });

      //   addText("Fetched data : " + JSON.stringify(res));
      //   break;

      // case "touch":
      //   if (!merged) {
      //     addWarn("Path required");
      //     return;
      //   }
      //   if (!filemgr.touch(mergedFilePath.path, "text")) {
      //     addError(`Failed to make file at ${merged}`);
      //     return;
      //   }
      //   addSuccess(`Successfully made file at ${merged}`);
      //   break;

      // case "rm":
      //   if (!merged) {
      //     addWarn("Path required");
      //     return;
      //   }
      //   const rmf = findFile(mergedFilePath);
      //   if (!rmf) {
      //     addError("No file! " + mergedFilePath.path);
      //     if (findDir(mergedFilePath)) {
      //       addWarn("If you want to remove a directory, use 'rmdir'.");
      //     }
      //     return;
      //   }
      //   if (filemgr.rm(mergedFilePath)) {
      //     addText("File removed");
      //   } else {
      //     addWarn("Failed to remove file");
      //   }
      //   return;
      // case "savebread":
      // case "loadbread":
      // case "resetbread":
      //   let forceAction = false;
      //   if (merged === "-f") {
      //     forceAction = true;
      //   }
      //   procmgr.exeCmd(cmd, { force: forceAction });
      //   return;
      // case "rmdir":
      //   if (!merged) {
      //     addWarn("Path required");
      //     return;
      //   }
      //   if (!filemgr.findDirValue(mergedFilePath)) {
      //     addError("No directory! " + mergedFilePath.path);
      //     return;
      //   }
      //   const info = filesInDirectory(filemgr.findDirValue(mergedFilePath));
      //   focusout();
      //   procmgr.openModal({
      //     title: "Remove directory",
      //     descs: [
      //       `Directory ${mergedFilePath.path} and its files will be removed,`,
      //       `which contains ${info.totalDirs} directories and ${info.totalFiles} files.`,
      //     ],
      //     buttons: ["Remove", "Cancel"],
      //     callbacks: [
      //       () => {
      //         // procmgr.modalResult = { result: "remove" };
      //         if (filemgr.rmdir(mergedFilePath)) {
      //           addText("Directory removed");
      //         } else {
      //           addWarn(
      //             `Failed to remove directory. ${
      //               mergedFilePath.isHome ? 'Directory was "home".' : ""
      //             }`
      //           );
      //         }
      //         procmgr.closeModal();
      //         {
      //           console.log("InputELem focus");
      //           inputElem.focus();
      //         }
      //       },
      //       () => {
      //         // procmgr.modalResult = { result: "cancel" };
      //         addWarn("Canceled.");
      //         procmgr.closeModal();
      //         console.log("InputELem focus");
      //         inputElem.focus();
      //       },
      //     ],
      //   });

      //   return;
      // case "ls":
      //   //join path if exists
      //   const dir = filemgr.lsValue(mergedFilePath);
      //   if (!dir) {
      //     addError(`No directory : ${mergedFilePath.path}`);
      //     break;
      //   }
      //   const buildPromptGridGroups = (dir: Dir): PromptItem => {
      //     const item: PromptItem = {
      //       comp: "PromptGridView",
      //       data: { pwd: dir.node.path, groups: <PromptFileViewGroup[]>[] },
      //     };

      //     const groups: PromptFileViewGroup[] = [];
      //     const _dirs: PromptFileViewGroup = {
      //       type: "Directory",
      //       // color: "#27e8a7",
      //       color: _colors["1"],
      //       items: [],
      //     };
      //     const _apps: PromptFileViewGroup = {
      //       type: "Application",
      //       // color: "#add7ff",
      //       color: _colors["1"],
      //       items: [],
      //     };
      //     const _texts: PromptFileViewGroup = {
      //       type: "Text file",
      //       // color: "#dbdbdb",
      //       color: _colors["1"],
      //       items: [],
      //     };
      //     dir.dirs.forEach((_) => {
      //       _dirs.items.push(_.node.path.last + "/");
      //     });
      //     dir.files.forEach((_) => {
      //       if (_.node.type === "text") {
      //         _texts.items.push(_.node.path.last);
      //         return;
      //       }
      //       _apps.items.push("./" + _.node.path.last);
      //     });
      //     const pushIfExists = (arr) => {
      //       if (arr.items.length) {
      //         item.data["groups"].push(arr);
      //       }
      //     };
      //     pushIfExists(_dirs);
      //     pushIfExists(_apps);
      //     pushIfExists(_texts);

      //     return item;
      //   };

      //   _add(buildPromptGridGroups(dir));
      //   break;
      // case "ps":
      //   addPs();

      //   break;
      // case "cd":
      //   if (!merged) {
      //     addWarn("Path required");
      //     return;
      //   }
      //   if (!filemgr.findDirValue(mergedFilePath)) {
      //     addError(`Directory '${mergedFilePath.path}' does not exist `);
      //     return;
      //   }
      //   pwd.set(mergedFilePath);
      //   break;
      // case "cat":
      //   dest = cmds.slice(1).join(" ");
      //   if (!dest) {
      //     addWarn("cat : path required");
      //     return;
      //   }
      //   const textpath = Path.join(pwd.path, dest);
      //   const f = filemgr.findFile(textpath);
      //   if (!f) {
      //     addError(`File : '${f.node.path.path}' does not exist `);
      //     return;
      //   }
      //   if (f.node.type !== "text") {
      //     addError(`${textpath.path} is not a text file!`);
      //     return;
      //   }
      //   addText((f.data as any)?.text);
      //   break;
      // case "finder":
      //   dest = Path.join(pwd.path, cmds.at(1)).path;
      //   procmgr.add("finder", { path: dest });
      //   break;
      // case "browser":
      //   dest = cmds.at(1) || "";
      //   procmgr.add("browser", { path: dest });
      //   break;
      case "whoami":
        addText(username);
        break;

      // //Terminal commands
      case "pwd":
        addText(`${pwd.path}`);
        break;
      case "clear":
        setPromptItems((items) => []);
        break;
      case "help":
        console.log("terminal help");
        addHelp();
        break;
      case "exit":
      case "quit":
        dispatch(killProc(proc.id));
        break;
      case "maximize":
        dispatch(toggleMaximize(proc.id));
        break;
      default:
        addError("No command : " + cmds.join(" "));
        break;
    }
  };

  const handleKeydown = (e) => {
    const keyMap = {
      Enter: handleCommand,
      // Tab: autoComplete,
      Escape: clearCommand,
      ArrowDown: cmdHistoryDown,
      ArrowUp: cmdHistoryUp,
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
          <span className={`${styles.inputLabel}`}>
            {username} {pwd.last}/
          </span>
          <span className={`${styles.inputBoxWrapper}`}>
            <textarea
              spellCheck={false}
              rows={1}
              className={`${styles.inputBox}`}
              id={inputElemId}
              value={cmdValue}
              onChange={(e) => {
                setCmdValue(e.target.value);
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
                ...item.data,
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
