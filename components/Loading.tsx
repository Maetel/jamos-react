import { useEffect } from "react";
import { randomId } from "../scripts/utils";
import styles from "../styles/Loading.module.css";

export default function Loading(props) {
  let barTop: string = props.barTop ?? "0px";
  let barHeight: string = props.barHeight ?? "30px;";
  let background: string = props.background ?? "#dbdbdb";
  let transition: string = props.transition ?? "1s";

  return (
    <div
      className={styles.container}
      // bind:this={loadingElem}
      style={{
        transition: transition,
        background: background,
      }}
    >
      <div className="loadingIconElem-wrapper">
        <img
          src="/imgs/loading.svg/"
          alt="Loading"
          className={`${styles.loadingIconElem} ${styles.rotate}`}
          // bind:this={loadingIconElem}
          style={{
            transition: transition,
          }}
        />
      </div>
      <div
        className={styles.progressBar}
        // bind:this={barElem}
        style={{
          height: barHeight,
          top: barTop,
        }}
      >
        <div
          className={`${styles.cover} ${styles.color1} ${styles.move} ${styles.right} `}
        />
        <div
          className={`${styles.cover} ${styles.transp} ${styles.move} ${styles.left}`}
        />
      </div>
    </div>
  );
}
