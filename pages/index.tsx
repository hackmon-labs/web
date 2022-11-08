import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import homeBG from '/public/assets/imgs/home.jpg'
import Logo from '/public/assets/imgs/LOGO.png'
import Link from 'next/link'
import Image from 'next/image'

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
      </Head>

      <main className={styles.main} style={{
        background: `url(${homeBG.src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}>
        <Image
            alt=''
            src={Logo}
            // fill="true"
          />
        {/* <h1 className={styles.title}>
          Hackmon
          </h1> */}
        
        {/* <Logo /> */}
        <ConnectButton />

        <div className={styles.link}>

        <Link href={{
          pathname: '/game',
        }}
          
          >play Hackmon</Link>
        </div>

      </main>
      
    </div>
  );
};

export default Home;
