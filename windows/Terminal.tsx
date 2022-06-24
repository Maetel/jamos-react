import { useEffect, useRef, useState } from "react";
import Window from "../components/Window";
import styles from "../styles/Terminal.module.css";
import { clamp, randomId } from "../scripts/utils";
import PromptTextView from "../components/PromptTextView";
import Path from "../scripts/Path";
import { useAppDispatch, useAppSelector } from "../app/hooks";
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
import FileMgr from "../features/file/FileMgr";
import PromptGridView, {
  PromptFileViewGroup,
} from "../components/PromptGridView";
import { Dir } from "../features/file/FileTypes";
import Log from "../features/log/Log";
import Commands from "../scripts/CommandParser";
import SetMgr from "../features/settings/SetMgr";
import officialThemes, { themeExists } from "../features/settings/Themes";
import { ToolbarControl } from "../grounds/Toolbar";
import { CollapsibleMenu, ToolbarItem } from "../scripts/ToolbarTypes";

const viewMap = {
  PromptTextView: PromptTextView,
  PromptTableView: PromptTableView,
  PromptGridView: PromptGridView,
};

interface PromptItem {
  id?: string;
  comp: string;
  data: {};
}

export default function Terminal(props) {
  const procmgr = ProcMgr.getInstance();
  const filemgr = FileMgr.getInstance();
  const setmgr = SetMgr.getInstance();
  const selector = useAppSelector;
  const proc = { ...props.proc };
  proc.name = proc.name ?? `Terminal`;
  const focusOnInput = () => {
    inputElem.current.focus();
  };
  proc.onFocus = focusOnInput;

  /////////////////////////
  const registerToolbarCallback = () => {
    const tb = ToolbarControl.getInstance();
    const register = (menu, item, cb, seperator?: boolean) => {
      const data: ToolbarItem = {
        caller: proc.id,
        menu: menu,
        item: item,
      };
      if (seperator) {
        data.separator = seperator;
      }
      tb.register(data, cb);
    };
    register("Terminal", "About terminal", async () => {
      // addHelp();
      await handleTerminalCmd(["terminal", "-h"]);
    });
    register("Terminal", "Help", async () => {
      // addHelp();
      await handleTerminalCmd(["help"]);
    });
    register(
      "Terminal",
      "View process list",
      async () => {
        // addHelp();
        await handleTerminalCmd(["ps"]);
      },
      true
    );
    register("Terminal", "Quit Terminal", () => {
      procmgr.kill(proc.id);
    });
    register("File", "New window ", () => {
      procmgr.add("terminal");
    });
  };

  /////////// init setup
  const inputElem = useRef(null);
  useEffect(() => {
    focusOnInput();
    registerToolbarCallback();
  }, []);

  const [username, setUsername] = useState("jam@127.0.0.1");
  const [cmdValue, setCmdValue] = useState("");

  //current directory
  const [pwd, setPwd] = useState(new Path("~/"));
  let _pwd = pwd;
  const updatePwd = () => {
    let p: Path = pwd.isSame(_pwd) ? pwd : _pwd;
    while (!filemgr.dirExists(p.path)) {
      p = new Path(p.parent);
    }
    setPwd(() => p);
  };

  //////////////////////////////////////////// command history
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

  /////////////////////////////////////////////////////// Prompt view
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
  const addPs = () => {
    const data = procmgr.psValue().map((p) => {
      // 0. this?
      // 1. id
      // 2. name
      // 3. type = windowed || deamon
      // 4. window z index
      // 5. if based on file, file path
      const retval = [
        p.id === proc.id ? ">" : "",
        p.id,
        p.name,
        p.isDaemon ? "daemon" : "window",
        p.zIndex,
        "",
      ];

      if (p.node) {
        retval[5] = p.node.path;
      }
      return retval;
    });
    const psData: TableData = {
      desc: "- Process List",
      // firstColumnColor: _colors["okay"],
      heads: ["This", "ID", "Name", "Type", "Index", "File path"],
      rows: data,
      weights: [2, 1, 4, 4, 2, 5],
    };
    const processItem: PromptItem = {
      comp: "PromptTableView",
      data: { tableData: psData },
    };
    _add(processItem);
  };
  // [command, usage, short description, long description]
  const appHelpData = [
    ["about", "about", "About JamOS🍞", "Brief explanation about JamOS."],
    [
      "appstore",
      "appstore",
      "Appstore for JamOS🍞",
      `AppStore lets you add and remove apps on your desktop. It's like an appstore for JamOS.`,
    ],
    [
      "terminal",
      "terminal",
      "CLI interface that can control JamOS",
      `Terminal is basically all you need to control the whole OS. You can add/remove files and directories from termianl, and also execute apps. Type 'help' on terminal to get more information.`,
    ],
    [
      "finder",
      "finder [$path]",
      "displays and interacts with directories and files",
      `Finder is 'finder' in macOS, and 'explorer' in Windows. You can browse and control files in GUI form.`,
    ],
    [
      "notepad",
      "notepad [$path]",
      "easy and simple text editor",
      "easy and simple text editor",
    ],
    [
      "markdown",
      "markdown [$path]",
      "markdown editor and viewer",
      "markdown editor and viewer",
    ],
    ["browser", "browser [$url]", "JamBrowser", "JamBrowser"],
    ["broom", "broom", "Process cleaner", "close all open processes"],
    ["settings", "settings", "OS settings", "open user settings"],
    [
      "styler",
      "styler [$style]",
      "JamOS Styler",
      `Set theme for JamOS. $style is case insensitive. Current style is [${
        setmgr.themeValue().name
      }]. To see possible styles, type 'styler -l'`,
    ],
    [
      "atelier",
      "atelier",
      "Interactive canvas",
      "Generative art demo. Select mode and drag on canvas to view",
    ],
  ];
  const terminalHelpData = [
    [
      "ls",
      "ls [$path]",
      "List dirs and files",
      `list all directories and files in the path. If executed without path argument, performs list towards 'pwd', which is '${pwd.path}'`,
    ],
    [
      "cd",
      "cd <$path>",
      "Goes to the path",
      "Browse in terminal using cd. ex) cd ../../Directory",
    ],
    [
      "mkdir",
      "mkdir <$path>",
      "Makes directories",
      "makes directories recursively to the path",
    ],
    ["cat", "cat <$path>", "reads a text file", "reads a text file"],
    ["rm", "rm <$path>", "removes a file", "removes a file"],
    [
      "rmdir",
      "rmdir <$path>",
      "removes a directory recursively",
      "removes a directory and all its including directories and files recursively",
    ],
    ["clear", "clear", "clears prompt", "clears prompt"],
    [
      "get",
      "get <$url>",
      "sends get request to url",
      "sends get request to url",
    ],
    ["whoami", "whoami", "shows your username", "shows your username"],
    [
      "maximize",
      "maximize",
      "toggle window maximize",
      "toggle window maximize",
    ],
    ["quit", "quit, exit", "quits this terminal", "quits this terminal"],

    [
      "touch",
      "touch <$path>",
      "makes a file in text mode",
      "makes a file in text mode and creates directories to the file path",
    ],
  ];
  const systemHelpData = [
    [
      "systeminfo",
      "systeminfo",
      "Process monitor",
      "View detailed information about currently running processes",
    ],
    ["ps", "ps", "process list", "process list"],
    ["kill", "kill <$processId>", "closes process", "closes process"],
    ["killall", "killall", "closes all processes", "closes all processes"],
    ["savebread", "savebread", "save current status", "save current status"],
    ["loadbread", "loadbread", "load saved", "load saved"],
    [
      "resetbread",
      "resetbread",
      "reset all data and settings and reboot",
      "reset all data and settings and reboot",
    ],
    [
      "get",
      "get <$url>",
      "<DEV> send get request and display response",
      "<DEV> send get request and display response",
    ],
    [
      "postman",
      "postman",
      "<DEV> send request and receive response",
      "<DEV> send request and receive response",
    ],
    [
      "logger",
      "logger",
      "<DEV>A logger watches over the whole OS and displays changes",
      "<DEV>A logger watches over the whole OS and displays changes",
    ],
    [
      "mv",
      "mv <$path:from> <$path:to>",
      "<To be updated>moves a file",
      "<To be updated>moves a file",
    ],
    [
      "cp",
      "cp <$path:from> <$path:to>",
      "<To be updated>copies a file",
      "<To be updated>copies a file",
    ],
    [
      "hub",
      "hub",
      "<To be updated> where you can create and share your bread with your friends.",
      "<To be updated> where you can create and share your bread with your friends.",
    ],
  ];
  const helpdata = [...appHelpData, ...terminalHelpData, ...systemHelpData];
  const addHelp = () => {
    const titleAndApps: TableData = {
      title: "JamOS Terminal Commands",
      desc: `- Applications, [optional] <required>`,
      heads: ["App Name", "Brief", "Description"],
      rows: appHelpData.map((row) => row.splice(1)),
      weights: [1, 2, 3],
    };
    const terminalCmds: TableData = {
      desc: "- Terminal Commands",
      heads: ["Terminal cmd", "Brief", "Description"],
      rows: terminalHelpData.map((row) => row.splice(1)),
      weights: [1, 2, 3],
    };

    const systemCmds: TableData = {
      desc: `- System commands, or dev/beta apps`,
      heads: ["System cmd", "Brief", "Description"],
      rows: systemHelpData.map((row) => row.splice(1)),
      weights: [1, 2, 3],
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

  ////////////////////////////////////////////////// main handlers

  const handleFocus = (e) => {
    updatePwd();
  };
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
    {
      //help
      const helps = ["-help", "--help", "-h", "--h"];
      const helpDataRowFound = helpdata.find((datum) => datum.at(0) === cmd);
      if (helps.includes(merged.toLowerCase()) && !!helpDataRowFound) {
        const helpTable: TableData = {
          title: `${cmd} - ${helpDataRowFound[2]}`,
          desc: `<$var> : var required  [$var] var is optional`,
          // firstColumnColor: _colors["okay"],
          heads: ["Command", "Usage", "Description"],
          rows: [
            [helpDataRowFound[0], helpDataRowFound[1], helpDataRowFound[3]],
          ],
          weights: [1, 2, 3],
        };
        const helpItem: PromptItem = {
          comp: "PromptTableView",
          data: { tableData: helpTable },
        };
        _add(helpItem);
        return;
      }
    }
    let mergedFilePath = merged.startsWith("~/")
      ? new Path(merged)
      : Path.join(pwd.path, merged);

    if (cmd.startsWith("./")) {
      const app = Path.join(pwd.path, cmd.slice(2));
      if (filemgr.fileExists(app.path)) {
        procmgr.exeFile(app);
        addText("Execute " + app.last);
        return;
      }
    }
    switch (cmd) {
      //   case "atelier":
      // case "postman":
      // case "markdown":
      // case "broom":
      case "about":
      case "settings":
      case "terminal":
      case "appstore":
      case "logger":
      case "settings":
      case "systeminfo":
        procmgr.add(cmd);
        break;
      case "notepad":
        if (merged.length === 0) {
          procmgr.add("notepad");
        } else {
          // console.log(merged);
          procmgr.add("notepad", { path: mergedFilePath.path });
        }
        break;
      case "styler":
        if (merged.length === 0) {
          procmgr.add("styler");
          break;
        }
        if (["-l", "--l", "-list", "--list"].includes(merged.toLowerCase())) {
          const buildStylerGrid = (): PromptItem => {
            const item: PromptItem = {
              comp: "PromptGridView",
              data: { groups: [] },
            };

            const groups: PromptFileViewGroup[] = officialThemes.map((_th) => {
              const retval: PromptFileViewGroup = {
                type: _th.name,
                items: [_th.name],
                cmds: [`styler ${_th.name}`],
                color: _th.colors["1"],
                bgColor: _th.colors["2"],
              };
              return retval;
            });
            item.data["groups"] = groups;
            return item;
          };

          _add(buildStylerGrid());
          break;
        }
        if (!themeExists(merged)) {
          addWarn(
            `Theme '${merged}' does not exists. Type 'styler --help' or 'style -h' for more info.`
          );
          break;
        }
        setmgr.setTheme(merged);
        addSuccess(`Theme '${merged} applied'`);
        break;
      // case "viewer":
      //   if (merged.length === 0) {
      //     addWarn("Path required for image viewer.");
      //     break;
      //   }

      //   procmgr.add("viewer", { path: mergedFilePath.path });
      //   break;
      case "cp":
      case "mv":
        addWarn("To be updated soon");
        break;

      case "mkdir":
        if (!merged) {
          addWarn("Path required");
          return;
        }
        if (filemgr.dirExists(mergedFilePath.path)) {
          addWarn(`Directory '${mergedFilePath.path}' already exists`);
          break;
        }

        // dispatch(mkdir(mergedFilePath.path));
        filemgr.mkdir(mergedFilePath.path);
        if (!filemgr.dirExists(mergedFilePath.path)) {
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
      case "kill":
        if (!procmgr.psValue().some((proc) => proc.id === merged)) {
          addWarn("No process id found : " + merged);
          break;
        }
        procmgr.kill(merged);
        addSuccess("Process killed : " + merged);
        break;
      case "killall":
        procmgr.killAll(proc.id);
        break;
      case "touch":
        if (!merged) {
          addWarn("Path required");
          return;
        }
        if (!filemgr.touch(mergedFilePath.path)) {
          addError(`Failed to make file at ${merged}`);
          return;
        }
        addSuccess(`Successfully made file at ${merged}`);
        break;

      case "rm":
        if (!merged) {
          addWarn("Path required");
          return;
        }
        const rmf = filemgr.fileExists(mergedFilePath.path);
        if (!rmf) {
          addError("No file! " + mergedFilePath.path);
          if (filemgr.dirExists(mergedFilePath.path)) {
            addWarn("If you want to remove a directory, use 'rmdir'.");
          }
          return;
        }
        if (filemgr.rm(mergedFilePath.path)) {
          addText("File removed");
        } else {
          addWarn("Failed to remove file");
        }
        return;
      // case "savebread":
      // case "loadbread":
      // case "resetbread":
      //   let forceAction = false;
      //   if (merged === "-f") {
      //     forceAction = true;
      //   }
      //   procmgr.exeCmd(cmd, { force: forceAction });
      //   return;
      case "rmdir":
        if (!merged) {
          addWarn("Path required");
          return;
        }
        if (!filemgr.dirExists(mergedFilePath.path)) {
          addError("No directory! " + mergedFilePath.path);
          return;
        }
        filemgr.rmdir(mergedFilePath.path);
        // const info = filesInDirectory(filemgr.findDirValue(mergedFilePath));
        // focusout();
        // procmgr.openModal({
        //   title: "Remove directory",
        //   descs: [
        //     `Directory ${mergedFilePath.path} and its files will be removed,`,
        //     `which contains ${info.totalDirs} directories and ${info.totalFiles} files.`,
        //   ],
        //   buttons: ["Remove", "Cancel"],
        //   callbacks: [
        //     () => {
        //       // procmgr.modalResult = { result: "remove" };
        //       if (filemgr.rmdir(mergedFilePath)) {
        //         addText("Directory removed");
        //       } else {
        //         addWarn(
        //           `Failed to remove directory. ${
        //             mergedFilePath.isHome ? 'Directory was "home".' : ""
        //           }`
        //         );
        //       }
        //       procmgr.closeModal();
        //       {
        //         console.log("InputELem focus");
        //         inputElem.focus();
        //       }
        //     },
        //     () => {
        //       // procmgr.modalResult = { result: "cancel" };
        //       addWarn("Canceled.");
        //       procmgr.closeModal();
        //       console.log("InputELem focus");
        //       inputElem.focus();
        //     },
        //   ],
        // });

        return;
      case "ls":
        //join path if exists
        const dir = filemgr.dirValue(mergedFilePath.path);
        if (!dir) {
          addError(`No directory : ${mergedFilePath.path}`);
          break;
        }
        const buildPromptGridGroups = (dir: Dir): PromptItem => {
          const item: PromptItem = {
            comp: "PromptGridView",
            data: { pwd: dir.node.path, groups: [] },
          };

          const groups: PromptFileViewGroup[] = [];
          const _dirs: PromptFileViewGroup = {
            type: "Directory",
            // color: "#27e8a7",
            // color: _colors["1"],
            items: [],
            cmds: [],
          };
          const _apps: PromptFileViewGroup = {
            type: "Application",
            // color: "#add7ff",
            // color: _colors["1"],
            items: [],
            cmds: [],
          };
          const _texts: PromptFileViewGroup = {
            type: "Text file",
            // color: "#dbdbdb",
            // color: _colors["1"],
            items: [],
            cmds: [],
          };
          dir.dirs.forEach((_) => {
            _dirs.items.push(new Path(_.node.path).last + "/");
            _dirs.cmds.push(_.node.exeCmd);
          });
          dir.files.forEach((_) => {
            if (_.node.type === "text") {
              _texts.items.push(new Path(_.node.path).last);
              _texts.cmds.push(_.node.exeCmd);
              return;
            }
            _apps.items.push("./" + new Path(_.node.path).last);
            _apps.cmds.push(_.node.exeCmd);
          });
          const pushIfExists = (arr) => {
            if (arr.items.length) {
              item.data["groups"].push(arr);
            }
          };
          pushIfExists(_dirs);
          pushIfExists(_apps);
          pushIfExists(_texts);

          return item;
        };

        _add(buildPromptGridGroups(dir));
        break;
      case "ps":
        addPs();
        break;
      case "cd":
        if (!merged) {
          addWarn("Path required");
          return;
        }
        if (!filemgr.dirExists(mergedFilePath.path)) {
          addError(`Directory '${mergedFilePath.path}' does not exist `);
          return;
        }
        _pwd = mergedFilePath;
        break;
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
      case "finder":
        dest = Path.join(pwd.path, cmds.at(1)).path;
        procmgr.add("finder", { path: dest });
        break;
      case "browser":
        dest = cmds.at(1) || "";
        procmgr.add("browser", { path: dest });
        break;
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
        // console.log("terminal help");
        addHelp();
        break;
      case "exit":
      case "quit":
        // dispatch(killProc(proc.id));
        procmgr.kill(proc.id);
        break;
      case "maximize":
        // dispatch(toggleMaximize(proc.id));
        procmgr.toggleMaximize(proc.id);
        break;
      default:
        addError("No command : " + cmds.join(" "));
        break;
    }
  };

  let tobeset = cmdValue;
  const handleKeydown = (e) => {
    const keyMap = {
      Enter: handleCommand,
      Tab: (e) => {
        autoComplete(e);
        setCmdValue(() => tobeset);
      },
      Escape: clearCommand,
      ArrowDown: cmdHistoryDown,
      ArrowUp: cmdHistoryUp,
    };
    keyMap[e.key]?.(e);
    updatePwd();
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
  const commands = new Commands();
  const autoComplete = (e) => {
    e.preventDefault();
    //path auto complete
    {
      const detachPwd = (path: string) => {
        if (!path.startsWith(pwd.path)) {
          //if input path does not begin with pwd, then return input value untouched
          return path;
        }
        return new Path(path.slice(pwd.path.length)).path;
      };

      const vals = cmdValue
        .split(" ")
        .filter((str) => str !== " " && str !== "");
      if (!vals.at(0)) {
        return;
      }
      const cmd = vals.at(0);
      const cmdRequiresPath = [
        "cd",
        "ls",
        "touch",
        "rm",
        "rmdir",
        "mv",
        "mkdir",
        "cat",
        "finder",
        "notepad",
        "markdown",
        "viewer",
      ];
      if (cmd.startsWith("./") && cmd.length >= 3 && vals.length === 1) {
        const input = cmd.slice(2);
        const pathToInput = Path.join(pwd.path, input);
        const dir = filemgr.dirValue(new Path(pathToInput.parent).path);
        if (!dir) {
          addWarn("Cannot execute : " + cmd);
          return;
        }
        const startWiths = dir.files.filter((file) =>
          file.node.path.startsWith(pathToInput.path)
        );
        if (startWiths.length === 0) {
          addWarn("No executable : " + cmd);
          return;
        }
        tobeset = `./${detachPwd(startWiths.at(0).node.path)}`;

        return;
      }
      if (cmdRequiresPath.includes(cmd) && vals.length === 1) {
        addWarn(`Add path to interact : ${vals.at(0)} path/to/a/file`);
        return;
      }
      if (cmdRequiresPath.includes(cmd) && vals.length >= 2) {
        let p = Path.join(pwd.path, vals.at(1));
        if (vals.at(1) && vals.at(1).startsWith("~/")) {
          p = new Path(vals.at(1));
        }
        Log.log("path : " + p.path + " , parent : " + p.parent);
        const dir = filemgr.dirValue(p.parent);
        if (dir) {
          //auto complete
          const startsWithsDir: string[] = [];
          const startsWithsFiles: string[] = [];
          dir.dirs
            .filter((node) => node.node.path.startsWith(p.path))
            .forEach((dir) => startsWithsDir.push(dir.node.path));
          dir.files
            .filter((node) => node.node.path.startsWith(p.path))
            .forEach((file) => startsWithsFiles.push(file.node.path));

          const dirCount = startsWithsDir.length,
            fileCount = startsWithsFiles.length;
          if (dirCount + fileCount <= 0) {
            //no match
            return;
          }

          if (dirCount + fileCount === 1) {
            if (dirCount === 1) {
              tobeset = `${vals.at(0)} ${detachPwd(startsWithsDir.at(0))}/`;
              return;
            }
            if (fileCount === 1) {
              tobeset = `${vals.at(0)} ${detachPwd(startsWithsFiles.at(0))}`;
              return;
            }
          }
          // return directory of shortest first if multiple matches, else file shortest path
          if (dirCount + fileCount > 1) {
            if (dirCount > 0) {
              tobeset = `${vals.at(0)} ${detachPwd(startsWithsDir.at(0))}/`;
              return;
            }
            tobeset = `${vals.at(0)} ${detachPwd(startsWithsFiles.at(0))}`;
            return;
          }
        }
      }
    }

    const cmds = commands.autoCompleteCommand(cmdValue);
    // addLog(cmds);
    if (cmds.length === 0) {
      addWarn(`No app begins with : "${cmdValue}"`);
      return;
    }
    if (cmds.length === 1) {
      Log.log("set auto complete");
      tobeset = cmds.at(0);
      return;
    }
    addText("Possible commands : " + cmds.join(", "));
  };

  return (
    <Window {...props} proc={proc}>
      <div className={`${styles.container}`} onMouseUp={handleFocus}>
        <div className={`${styles.inputArea}`}>
          <span className={`${styles.inputLabel}`}>
            {username} {pwd.last}/
          </span>
          <span className={`${styles.inputBoxWrapper}`}>
            <textarea
              className={`${styles.inputBox}`}
              spellCheck={false}
              rows={1}
              ref={inputElem}
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
      </div>
    </Window>
  );
}
