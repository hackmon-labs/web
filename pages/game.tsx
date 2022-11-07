
import { useState, useEffect } from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useContext } from 'react';
// import Talk from '../components/Talk'
// import { useAppSelector } from '../hooks'
import styles from '../styles/game.module.css';



const DynamicComponentWithNoSSR = dynamic(
  () => import('../components/phaserGame'),
  { ssr: false }
)

const DynamicComponentWithNoSSRLogin = dynamic(
  () => import('../components/login'),
  { ssr: false }
)

const DynamicComponentWithNoSSRTalk = dynamic(
  () => import('../components/Talk'),
  { ssr: false }
)

const Game: NextPage = () => {
  // @ts-ignore
  const [loading, setLoading] = useState(false);
  // const talkOpen = useAppSelector((state) => state.talk.open)

  useEffect(() => {
    setLoading(true);
    console.log('set loading')
  }, []);

  return (
    <div>
      <Head>
        <title>Hackmon</title>
        <meta name="description" content="Hackmon" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Silkscreen&display=swap" rel="stylesheet" /> 
      </Head>

      <main className={styles.hackmonBox}>
        {/* <DynamicComponentWithNoSSR /> */}

        <div key={Math.random()} id="hackmon-game"></div>
        {loading ? <DynamicComponentWithNoSSR /> : "Loading..."}
        {loading ? <DynamicComponentWithNoSSRLogin /> : null}
        {/* {talkOpen && <Talk/>} */}
        {loading && <DynamicComponentWithNoSSRTalk />}
      </main>
      {/* <Talk /> */}

    </div>
  );
};

export default Game;