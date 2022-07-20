import { useEffect, useState } from "react";
import ShimmerImage from "../components/ShimmerImage";
import JamOS from "../features/JamOS/JamOS";
import { Notif } from "../features/JamOS/osSlice";
import useEffectOnce from "../scripts/useEffectOnce";
import { clamp } from "../scripts/utils";
import styles from "../styles/Notification.module.css";

interface NotifWithI extends Notif {
  idx: number;
}
export default function Notification(props) {
  const notifs: Notif[] = JamOS.notifs;
  const notifDuration = JamOS.notifDuration;
  const notifsToShow: NotifWithI[] = JamOS.getReadable("notifsToShow");
  const showLastNotifs: boolean = JamOS.getReadable("showLastNotifs");
  const colors = JamOS.theme.colors;

  // const timer = JamOS.getReadable("timer");
  // const setTimer = () => {
  //   JamOS.set({ timer: Date.now() });
  // };
  const [timer, _setTimer] = useState(Date.now());
  const setTimer = () => {
    _setTimer(Date.now());
  };
  useEffectOnce(() => {
    // return;
    const intervalId = setInterval(setTimer, 500);
    return () => {
      clearInterval(intervalId);
    };
  });

  useEffect(() => {
    if (!timer) {
      return;
    }
    const shows = notifs
      .map((notif, i): NotifWithI => ({ ...notif, idx: i }))
      .filter((notif) => notif.timestamp > timer - notifDuration);
    const arr = JamOS.getValue("notifsToShow");
    if (arr && arr.length === 0 && shows.length === 0) {
      return;
    }
    JamOS.set({ notifsToShow: shows });
  }, [timer]);

  const buildNotifStyle = (type: string) => {
    //idx begins from 0
    const retval = {
      boxShadow: colors.boxShadow,
      backgroundColor: colors["1"] + "ee",
      color: colors["2"],
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
        retval["color"] = colors["1"];
        retval["backgroundColor"] = colors["2"];
        retval["fontWeight"] = 500;
        retval["textDecoration"] = "underline";
        break;
      default:
        break;
    }
    return retval;
  };

  const buildStyle = () => {
    const retval = {
      // display: show ? "block" : "none",
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
      : notifsToShow.slice(notifsToShow.length - fixLen).reverse();
  };
  const fixedNotifs = buildFixed();
  const notifsToShowSliced = buildSliced();

  return (
    <div
      className={`${styles.container} ${showFixed && styles.showFixed}`}
      onPointerEnter={(e) => {
        setHovered(true);
      }}
      onPointerLeave={(e) => {
        setHovered(false);
      }}
    >
      {showFixed
        ? notifs?.length > 0 && (
            <>
              <ul className={`${styles.list} ${styles.fixed}`}>
                {fixedNotifs?.map((notif, i) => (
                  <li
                    key={i}
                    className={styles.item}
                    style={buildNotifStyle(notif?.type)}
                    onClick={(e) => {
                      JamOS.procmgr.add("notif");
                    }}
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
            </>
          )
        : notifsToShow &&
          notifsToShow?.length > 0 && (
            <ul className={styles.list}>
              {notifsToShowSliced?.map((notif) => (
                <li
                  key={notif.idx}
                  className={styles.item}
                  style={buildNotifStyle(notif?.type)}
                  onClick={(e) => {
                    JamOS.procmgr.add("notif");
                  }}
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
