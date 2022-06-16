import { ProcessCommands } from "../features/procmgr/ProcTypes";

export default class Commands {
  // class Commands {
  constructor() {}
  public static ProcMgrCommandList: string[] = [...ProcessCommands];

  public TerminalCommandList = [
    "cd",
    "pwd",
    "echo",
    "clear",
    "help",
    "get",
    "whoami",
    "ls",
    "mkdir",
    "cat",
    "touch",
    "rm",
    "mv",
    "cp",
    "whoami",
    "exit",
    "quit",
    "ps",
    "maximize",
  ];

  public possibleCommands = [
    ...Commands.ProcMgrCommandList,
    ...this.TerminalCommandList,
  ];
  public validateCommand(cmd: string) {
    return this.possibleCommands.includes(cmd);
  }
  public autoCompleteCommand(cmd: string, from?: string[]) {
    if (!from) {
      from = this.possibleCommands;
    }
    return from.filter((_cmd) => _cmd.startsWith(cmd));
  }
  public destination(cmd: string) {
    if (this.TerminalCommandList.includes(cmd)) {
      return "terminal";
    }
    if (Commands.ProcMgrCommandList.includes(cmd)) {
      return "procmgr";
    }
    return undefined;
  }
}
