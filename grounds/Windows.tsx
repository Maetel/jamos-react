import React, { ReactElement, useEffect, useState } from "react";
import styles from "../styles/Windows.module.css";
import TestWindow from "../windows/TestWindow";

const winCmdMap: { [key: string]: (props) => JSX.Element } = {
  testwindow: TestWindow,
};

export default function Windows(props) {
  let [windows, setWindows] = useState(["testwindow"]);
  return (
    <div className={styles.container}>
      <button
        className="add"
        onClick={() => {
          setWindows([...windows, "testwindosw"]);
        }}
      >
        add test
      </button>
      {windows
        .filter((winname) => {
          console.error("No such element : ", winname);
          return !!winCmdMap[winname];
        })
        .map((winname, i) =>
          React.createElement(winCmdMap[winname], { key: i })
        )}
    </div>
  );
}
