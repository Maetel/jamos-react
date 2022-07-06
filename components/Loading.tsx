import Image from "next/image";
import { useEffect } from "react";
import { randomId } from "../scripts/utils";
import styles from "../styles/Loading.module.css";

export default function Loading(props) {
  let barTop: string = props.barTop ?? "0px";
  let barHeight: string = props.barHeight ?? "30px";
  let background: string = props.background ?? "#dbdbdb";
  let transition: string = props.transition ?? "1s";
  let borderRadius: string = props.borderRadius ?? "0px";
  let width: string = props.width ?? "100%";
  let height: string = props.height ?? "100%";

  return (
    <div
      className={styles.container}
      // bind:this={loadingElem}
      style={{
        transition: transition,
        background: background,
        width: "100%",
        height: "100%",
        borderRadius: borderRadius,
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
