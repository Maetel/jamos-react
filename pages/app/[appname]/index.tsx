import { useRouter } from "next/router";
import styles from "../../../styles/Home.module.css";
import Meta from "../../../grounds/Meta";
import Desktop from "../../../grounds/Desktop";
import Windows from "../../../grounds/Windows";
import Toolbar from "../../../grounds/Toolbar";
import Dock from "../../../grounds/Dock";
import Notification from "../../../grounds/Notification";
import { useEffect } from "react";
import JamOS from "../../../features/JamOS/JamOS";
import { ProcessCommands } from "../../../features/procmgr/ProcTypes";

const App = () => {
  const router = useRouter();
  const { appname, args } = router.query;

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    JamOS.procmgr.bootload(true);

    const app: string = appname as string;
    if (app && ProcessCommands.includes(app)) {
      if (args && args.length > 0) {
        const cmd = `${app} ${args}`;
        JamOS.procmgr.exeCmd(cmd);
      } else {
        JamOS.procmgr.add(appname as string);
      }
    } else {
      JamOS.setNotif(`${app} is not executable`);
      setTimeout(() => {
        const home =
          process.env.NODE_ENV === "production"
            ? "https://jamos.link/"
            : "http://localhost:3001";
        window.location.href = home;
      }, 1500);
    }
  }, [router.isReady]);

  return (
    <div className={styles.container}>
      <Meta></Meta>
      <main className={styles.main}>
        <Toolbar></Toolbar>
        <Dock></Dock>
        <Desktop></Desktop>
        <Windows></Windows>
        <Notification></Notification>
      </main>
    </div>
  );
};

export default App;
