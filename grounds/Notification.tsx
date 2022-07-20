import { useEffect, useState } from "react";
import JamOS from "../features/JamOS/JamOS";
import { Notif } from "../features/JamOS/osSlice";
import { clamp } from "../scripts/utils";
import styles from "../styles/Notification.module.css";

export default function Notification(props) {
  const notifs: Notif[] = JamOS.notifs;
  const notifDuration = JamOS.notifDuration;
  const notifsToShow: Notif[] = JamOS.getReadable("notifsToShow");
  const showLastNotifs: Notif[] = JamOS.getReadable("showLastNotifs");
  const colors = JamOS.theme.colors;

  const timer = JamOS.getReadable("timer");
  // const lastNotif = JamOS.getReadable('')
  useEffect(() => {
    const intervalId = setInterval(() => {
      JamOS.set({ timer: Date.now() });
    }, 300);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!timer) {
      return;
    }
    const shows = notifs.filter(
      (notif) => notif.timestamp > timer - notifDuration
    );
    JamOS.set({ notifsToShow: shows });
  }, [timer]);

  const buildNotifStyle = (type: string, idx: number) => {
    //idx begins from 0
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
      boxShadow: colors.boxShadow,
      backgroundColor: colors["1"],
    };
    return retval;
  };
  const style = buildStyle();

  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const _mouseEdgeDetect = () => {
      const NotifTriggerHeight = 0.1;
      const NotifTriggerWidth = 0.2;
      const detectEdge = (e) => {
        const isEdge =
          Math.abs(e.clientY - window.innerHeight) /
            (window.innerHeight + 0.1) <
            NotifTriggerHeight &&
          Math.abs(e.clientX - window.innerWidth) / (window.innerWidth + 0.1) <
            NotifTriggerWidth;
        JamOS.set({ showLastNotifs: isEdge });
      };
      window.addEventListener("mousemove", detectEdge);
      return () => {
        window.removeEventListener("mousemove", detectEdge);
      };
    };
    const f = _mouseEdgeDetect();
    return f;
  }, []);

  const showFixed = hovered || showLastNotifs;
  const fixLen = 5;
  const buildFixed = () => {
    if (1 && notifs) {
      //show all in revered order
      const copied = [...notifs];
      copied.reverse();
      return copied;
    }

    const candidate =
      notifs?.length < fixLen ? notifs : notifs?.slice(notifs?.length - fixLen);
    if (!candidate) {
      return null;
    }
    const copied = [...candidate];
    copied.reverse();
    return copied;
  };
  const buildSliced = () => {
    if (!notifsToShow) {
      return null;
    }
    return notifsToShow.length < fixLen
      ? notifsToShow
      : notifsToShow.slice(notifsToShow.length - fixLen);
  };
  const fixedNotifs = buildFixed();
  const notifsToShowSliced = buildSliced();

  return (
    <div
      className={styles.container}
      onPointerEnter={(e) => {
        setHovered(true);
      }}
      onPointerLeave={(e) => {
        setHovered(false);
      }}
    >
      {showFixed
        ? notifs?.length > 0 && (
            <ul className={styles.list}>
              {fixedNotifs?.map((notif, i) => (
                <li
                  key={i}
                  className={styles.item}
                  style={{ ...buildNotifStyle(notif?.type, i), ...style }}
                >
                  <div className={styles.text}>
                    {notif.type === "system"
                      ? `[System] ${notif.msg}`
                      : notif.msg}
                  </div>
                  <div className={styles.timestamp}>
                    {new Date(notif.timestamp).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )
        : notifsToShow &&
          notifsToShow?.length > 0 && (
            <ul className={styles.list}>
              {notifsToShowSliced?.map((notif, i) => (
                <li
                  key={i}
                  className={styles.item}
                  style={{ ...buildNotifStyle(notif.type, i), ...style }}
                >
                  <div className={styles.text}>
                    {notif.type === "system"
                      ? `[System] ${notif.msg}`
                      : notif.msg}
                  </div>
                </li>
              ))}
            </ul>
          )}
    </div>
  );
}
