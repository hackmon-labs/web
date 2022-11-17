
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

const DynamicComponentWithNoSSRRPG = dynamic(
  () => import('../components/rpg/rpg'),
  { ssr: false }
)

const DynamicComponentWithNoSSRButton = dynamic(
  () => import('../components/button/index'),
  { ssr: false }
)

const Game: NextPage = () => {
  // @ts-ignore
  const [hasLoad, setHasLoad] = useState(false);
  // const talkOpen = useAppSelector((state) => state.talk.open)

  useEffect(() => {
    setHasLoad(true);
    console.log('set hasLoad')
  }, []);

  return (
    <div>
      <Head>
        <title>Hackmon</title>
        <meta name="description" content="Hackmon" />
        <link rel="icon" href="/favicon.ico" />

      </Head>

      <main className={styles.hackmonBox}>
        {/* <DynamicComponentWithNoSSR /> */}
        {hasLoad
          && (
            <>
            <div key={Math.random()} id="hackmon-game"></div>
            <DynamicComponentWithNoSSR />
            <DynamicComponentWithNoSSRLogin />
          <DynamicComponentWithNoSSRTalk />
          <DynamicComponentWithNoSSRRPG />
            <DynamicComponentWithNoSSRButton/>
            </>
          )

        }

       
      </main>
      {/* <Talk /> */}

    </div>
  );
};

export default Game;