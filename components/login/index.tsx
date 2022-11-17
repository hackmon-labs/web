import React, { useState, useEffect } from 'react'


import { setLoggedIn } from '../../stores/UserStore'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from '../../styles/game.module.css'
import { useAccount, useSignMessage } from 'wagmi'

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
  
  const [showError, setShowError] = useState<boolean>(false)
  //
  const [hasPlay, setHasPlay] = useState<boolean>(false)


  const { address, isConnected } = useAccount()

  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message: 'welcome hackmon!',
  })

  useEffect(() => {
    if (isConnected) {
      setShowError(false)
    }
  }, [isConnected])



  const play = () => {
   

    // signMessage()
    start()
  }


  const start=()=>{
    let game = window.game?.scene?.keys?.game
    const forest = window.game?.scene?.keys?.forest
    if (!game?.myPlayer) {
      game = window.game?.scene?.keys?.forest
    }
    if (!game?.myPlayer || !address) return

    game.registerKeys()
    game.myPlayer.setPlayerName(formatAddress(address as string))
    game.myPlayer.setPlayerTexture('adam')
    setHasPlay(true)
  }

  // useEffect(()=>{
  //     console.log(data,'data no')

  //   if(data){
  //     console.log(data,'data')
   
  //   }

  // },[data])







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
