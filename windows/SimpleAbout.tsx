import { sign } from "crypto";
import { useEffect } from "react";
import ChildWindow from "../components/ChildWindow";
import JamOS from "../features/JamOS/JamOS";
import Process from "../features/procmgr/ProcTypes";

export interface AboutProps {
  title: string;
  desc: string;
  [key: string]: any;
}

export default function SimpleAbout(props) {
  const proc: Process = { ...props.proc };
  const abouts: AboutProps = proc.aboutProps;
  proc.name = abouts.title;
  proc.resize = "none";
  proc.rect = proc.rect ?? {
    top: "15%",
    left: "35%",
    width: "30%",
    height: "10%",
  };
  // proc.disableDrag = proc.disableDrag ?? true;
  proc.disableBackground = true;
  // proc.hideNav = true;

  const desc = abouts.desc;

  //forward key/value pairs
  // ex) rect, style, ...
  // for (let key in abouts) {
  //   if (key === "title" || key === "desc") {
  //     continue;
  //   }
  //   proc[key] = abouts[key];
  // }

  const _front = JamOS.procmgr.front();
  const isFront = _front.id === proc.id;

  const handleEscape = (e) => {
    if (e.key === "Escape" && isFront) {
      JamOS.procmgr.kill(proc.id);
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isFront]);

  return (
    <ChildWindow {...props} proc={proc}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.1rem",
        }}
      >
        {desc}
      </div>
      <div
        className="inst"
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          fontSize: "0.9rem",
        }}
      >
        Press Esc to continue...
      </div>
    </ChildWindow>
  );
}
