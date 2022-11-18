
import { useState, useEffect } from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import styles from '../styles/game.module.css';



const HackMonGame = dynamic(
  () => import('../components/phaserGame'),
  { ssr: false }
)

const Login = dynamic(
  () => import('../components/login/Login'),
  { ssr: false }
)

const Talk = dynamic(
  () => import('../components/Talk'),
  { ssr: false }
)

const RPGGame = dynamic(
  () => import('../components/rpg/RpgGame'),
  { ssr: false }
)

const ButtonCom = dynamic(
  () => import('../components/button/index'),
  { ssr: false }
)

const Game: NextPage = () => {
  // @ts-ignore
  const [hasLoad, setHasLoad] = useState(false);

  useEffect(() => {
    setHasLoad(true);
  }, []);

  return (
    <div>
      <Head>
        <title>Hackmon</title>
        <meta name="Hackmon" content="Hackmon" />

      </Head>

      <main className={styles.hackmonBox}>
        {/* <HackMonGame /> */}
        {hasLoad  
          && (
            <>
            <div key={Math.random()} id="hackmon-game"></div>
            <HackMonGame />
            <Login />
          <Talk />
          <RPGGame />
            <ButtonCom/>
            </>
          )

        }

       
      </main>
      {/* <Talk /> */}

    </div>
  );
};

export default Game;