import React, { ReactElement, useEffect, useState } from "react";
import { Window } from "../components/Window";
import { randomId } from "../scripts/utils";
import styles from "../styles/Windows.module.css";
import TestWindow from "../windows/TestWindow";

const winCmdMap: { [key: string]: (props) => JSX.Element } = {
  testwindow: TestWindow,
};

const windows = ["testwindow"];

export default function Windows(props) {
  return (
    <div className={styles.container}>
      {windows.map((winname, i) =>
        React.createElement(winCmdMap[winname], { key: i })
      )}
    </div>
  );
}
