import { useEffect, useState } from "react";
import JamOS from "../features/JamOS/JamOS";
import { Notif } from "../features/JamOS/osSlice";
import styles from "../styles/Notification.module.css";

export default function Notification(props) {
  const notifs: Notif[] = JamOS.notifs;
  const notifDuration = JamOS.notifDuration;
  const [lastNotifIdx, setLastNotifIdx] = useState<number>(null);
  const [lastNotif, setLastNotif] = useState<Notif>(null);
  const [show, setShow] = useState(false);
  const colors = JamOS.theme.colors;
  const buildNotifStyle = (type) => {
    switch (type) {
      case "success":
        return {
          color: colors.okay,
        };
      case "warn":
        return {
          color: colors.warn,
        };
      case "error":
        return {
          color: colors.error,
        };
      case "system":
        return {
          color: colors.okay,
        };

      default:
        return {
          color: colors["2"],
        };
        break;
    }
  };

  const buildStyle = () => {
    const retval = {
      // display: show ? "block" : "none",
      border: `1px solid ${colors["3"]}`,
      boxShadow: colors.boxShadow,
      backgroundColor: colors["1"],
    };
    return retval;
  };
  const style = buildStyle();

  useEffect(() => {
    if (notifs.length <= 0) {
      return;
    }
    setShow(true);
    {
      (
        document.querySelector(`.${styles.container}`) as HTMLElement
      )?.classList.add(styles.active);
    }
    if (lastNotifIdx === null) {
      setLastNotifIdx(0);
    } else {
      setLastNotifIdx((idx) => idx + 1);
    }
    setTimeout(() => {
      setShow(false);
      (
        document.querySelector(`.${styles.container}`) as HTMLElement
      )?.classList.remove(styles.active);
    }, notifDuration);
  }, [notifs, notifDuration]);

  useEffect(() => {
    if (lastNotifIdx === null) {
      return;
    }
    setLastNotif(notifs.at(lastNotifIdx));
  }, [lastNotifIdx]);

  return (
    <div className={styles.container} style={style}>
      <div className={styles.notif} style={buildNotifStyle(lastNotif?.type)}>
        {lastNotif?.type === "system"
          ? `System : ${lastNotif?.msg}`
          : lastNotif?.msg}
      </div>
    </div>
  );
}
