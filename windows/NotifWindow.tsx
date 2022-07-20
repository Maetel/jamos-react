import { useEffect } from "react";
import ShimmerImage from "../components/ShimmerImage";
import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";
import useEffectOnce from "../scripts/useEffectOnce";
import { randomId } from "../scripts/utils";
import styles from "../styles/NotifWindow.module.css";

export default function NotifWindow(props) {
  const proc: Process = { ...props.proc };
  proc.name = proc.name ?? "";
  proc.rect = proc.rect ?? { width: "640px", height: "480px" };

  const colors = JamOS.theme.colors;
  const notifs = [...JamOS.notifs].reverse();

  const buildNotifStyle = (type: string) => {
    //idx begins from 0
    const retval = {
      color: colors["1"],
    };
    switch (type) {
      case "success":
        retval["color"] = colors.okay;
        break;
      case "warn":
        retval["color"] = colors.warn;
        break;
      case "error":
        retval["color"] = colors.error;
        break;
      case "system":
        retval["color"] = colors.okay;
        break;
      default:
        break;
    }
    return retval;
  };

  const candidates = ["log", "success", "warn", "error", "system"];
  const addRandomNotif = () => {
    const num = Math.floor(Math.random() * 5);
    const candidate = candidates[num] as
      | "log"
      | "success"
      | "warn"
      | "error"
      | "system";
    JamOS.setNotif(
      `${candidate} notif. Random message : ${randomId()}`,
      candidate
    );
  };

  const includes: string[] = JamOS.procmgr.getReadable(proc.id, "includes") ?? [
    ...candidates,
  ];

  const setIncludes = (arr: string[]) => {
    JamOS.procmgr.set(proc.id, { includes: arr });
  };
  const toggleIncludes = (keyword: string) => {
    let incls: string[] = JamOS.procmgr.getValue(proc.id, "includes");
    if (!incls) {
      setIncludes([keyword]);
      return;
    }
    incls = [...incls];
    if (incls.includes(keyword)) {
      incls = incls.filter((key) => key !== keyword);
      if (incls.length === 0) {
        incls = null;
      }
    } else {
      incls.push(keyword);
    }
    setIncludes(incls);
  };
  const iconCheck = "/imgs/circlecheck.svg";
  const iconX = "/imgs/circledash.svg";
  const isOn = (btn: string) => {
    const incls = JamOS.procmgr.getValue(proc.id, "includes");
    if (!incls) {
      return btn === "all";
    }
    const on =
      incls.includes(btn) ||
      (btn === "all" &&
        !incls.reduce((prev, next) => prev && candidates.includes(next), true));
    return on;
  };
  const iconSrc = (btn: string) => {
    return isOn(btn) ? iconCheck : iconX;
  };
  // useEffect(() => {}, [includes]);

  const btnList = ["all", "log", "system", "error", "warn", "success"];
  const btnName = {
    all: "All",
    log: "Log",
    system: "System",
    error: "Error",
    warn: "Warning",
    success: "Success",
  };
  const btnColor = {
    system: colors.okay,
    error: colors.error,
    warn: colors.warn,
    success: colors.okay,
  };

  return (
    <Window {...props} proc={proc}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Notification list</h1>
          {null && (
            <button
              onClick={(e) => {
                addRandomNotif();
              }}
            >
              add random notif
            </button>
          )}
          <ul
            className={styles.btnList}
            style={{ borderBottom: `1px solid ${colors["1"]}33` }}
          >
            {btnList.map((btn) => (
              <button
                key={btn}
                className={styles.btn}
                onClick={(e) => {
                  if (btn === "all") {
                    setIncludes(null);
                  } else {
                    toggleIncludes(btn);
                  }
                }}
                style={{
                  color: btnColor[btn] ?? colors["1"],
                  background: colors["2"],
                  boxShadow: `1px 1px 5px ${colors["1"]}aa`,
                }}
              >
                <span className={styles.btnName}>{btnName[btn]}</span>
                <div
                  className={styles.iconWrapper}
                  style={{
                    backgroundColor: isOn(btn) ? colors.okay : colors.warn,
                  }}
                >
                  <ShimmerImage
                    width={30}
                    height={30}
                    src={iconSrc(btn)}
                  ></ShimmerImage>
                </div>
              </button>
            ))}
          </ul>
        </header>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th1}>Index</th>
              <th className={styles.th2}>Type</th>
              <th className={styles.th3}>Timestamp</th>
              <th className={styles.th4}>Message</th>
            </tr>
          </thead>
          <tbody>
            {notifs
              ?.filter((notif) => includes.includes(notif.type))
              .map((notif, i) => {
                return (
                  <tr key={i} className={styles.item}>
                    <th>{i + 1}.</th>
                    <th style={buildNotifStyle(notif?.type)}>
                      {btnName[notif.type]}
                    </th>
                    <th>{new Date(notif.timestamp).toLocaleString()}</th>
                    <th>{notif.msg}</th>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </Window>
  );
}
