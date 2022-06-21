import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import Meta from "../grounds/Meta";
import Desktop from "../grounds/Desktop";
import Windows from "../grounds/Windows";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Meta></Meta>
      <main className={styles.main}>
        <Desktop></Desktop>
        <Windows></Windows>
      </main>
    </div>
  );
};

export default Home;
