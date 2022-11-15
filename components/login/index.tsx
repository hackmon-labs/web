import React, { useState, useEffect } from 'react'

import Adam from '../assets/Adam_login.png'
import phaser from 'phaser'

// import { useAppSelector, useAppDispatch } from '../../hooks'
import { setLoggedIn } from '../../stores/UserStore'

// import phaserGame from '../phaserGame'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from '../../styles/game.module.css'
import { useAccount, } from 'wagmi'

// @ts-ignore



function formatAddress(address: string): string {
  const leadingChars = 4;
  const trailingChars = 4;

  return address.length < leadingChars + trailingChars
    ? address
    : `${address.substring(0, leadingChars)}\u2026${address.substring(
      address.length - trailingChars
    )}`;
}

export default function LoginDialog() {
  const [name, setName] = useState<string>('')
  const [avatarIndex, setAvatarIndex] = useState<number>(0)
  const [nameFieldEmpty, setNameFieldEmpty] = useState<boolean>(false)
  const [showError, setShowError] = useState<boolean>(false)
  // const dispatch = useAppDispatch()
  // const connected = useAppSelector((state) => state.user.connected)
  // const videoConnected = useAppSelector((state) => state.user.videoConnected)
  // const game = window.game
  // console.log(window, game, phaser)
  const [hasPlay, setHasPlay] = useState<boolean>(false)


  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (isConnected) {
      setShowError(false)
    }
  }, [isConnected])



  const play = () => {
    let game = window.game?.scene?.keys?.game 
    const forest= window.game?.scene?.keys?.forest 
    console.log(game,'game1')
    if(!game?.myPlayer){
      game=window.game?.scene?.keys?.forest 
    }
    console.log(game,'game2')

    if (!game?.myPlayer || !address) return
    console.log(game,'game')
    game.registerKeys()
    game.myPlayer.setPlayerName(formatAddress(address as string))
    game.myPlayer.setPlayerTexture('adam')
    setHasPlay(true)
  }







  return (

    <div>
      {!hasPlay&&
        <div onClick={play} className={styles.playBtn}>play hackmon!</div>
      }
      <div style={{
        position: 'fixed',
        right: '0',
        top: '0'
      }}>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 12,
        }}>
          <ConnectButton />
        </div>
      </div>

    </div>
  )

}
