import { useEffect } from "react";
import { randomId } from "../scripts/utils";
import styles from "../styles/Loading.module.css";

export default function Loading(props) {
  let barTop: string = "0px";
  let barHeight: string = "30px;";
  let background: string = "#dbdbdb";
  let transition: string = "1s";

  let loadingElem: HTMLElement, loadingIconElem: HTMLElement;
  let barElem: HTMLElement;
  const loadingElemId = randomId(),
    loadingIconElemId = randomId(),
    barElemId = randomId();
  const setElems = () => {
    loadingElem = loadingElem ?? document.querySelector(`#${loadingElemId}`);
    loadingIconElem =
      loadingIconElem ?? document.querySelector(`#${loadingIconElemId}`);
    barElem = barElem ?? document.querySelector(`#${barElemId}`);
  };
  useEffect(() => {
    setElems();
    loadingElem.style.transition = transition;
    loadingIconElem.style.transition = transition;
    loadingElem.style.background = background;
    barElem.style.setProperty("height", barHeight);
    barElem.style.setProperty("top", barTop);
  }, []);

  return (
    <div
      className={styles.container}
      // bind:this={loadingElem}
      id={loadingElemId}
    >
      <div className="loadingIconElem-wrapper">
        <img
          src="/imgs/loading.svg/"
          alt="Loading"
          className={`${styles.loadingIconElem} ${styles.rotate}`}
          // bind:this={loadingIconElem}
          id={loadingIconElemId}
        />
      </div>
      <div
        className={styles.progressBar}
        id={barElemId}
        // bind:this={barElem}
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
