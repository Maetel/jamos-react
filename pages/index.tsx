import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Desktop from '../grounds/Desktop'
import Windows from '../grounds/Windows'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>JamOS</title>
        <meta name="description" content="JamOS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Desktop></Desktop>
        <Windows></Windows>
      </main>

      <footer className={styles.footer}>
        
      </footer>
    </div>
  )
}

export default Home
