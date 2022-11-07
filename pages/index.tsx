import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import homeBG from '/public/assets/imgs/home.jpg'
import Link from 'next/link'

const Home: NextPage = () => {

 
  return (
    <div className={styles.containerBox}>
      <Head>
        <title>Hackmon</title>
        <meta
          name="description"
          content="Hackmon.xyz"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
        <link href="https://fonts.googleapis.com/css2?family=Silkscreen&display=swap" rel="stylesheet"/>
      </Head>

      <main className={styles.main} style={{
        background: `url(${homeBG.src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}>
        <h1 className={styles.title}>Hackmon</h1>
        <ConnectButton />

        <div className={styles.link}>

        <Link href={{
          pathname: '/game',
        }}
          
        >play</Link>
        </div>

      </main>
      
    </div>
  );
};

export default Home;
