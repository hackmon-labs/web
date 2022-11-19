/* eslint-disable */

import React, { useState, useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '../../hooks'

import { setLoggedIn } from '../../stores/UserStore'
import {  setInfo } from '../../stores/UserStore'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from '../../styles/game.module.css'
import { useAccount, useSignMessage } from 'wagmi'
import {FIND_URL,CEATE_URL,fethchFn}  from '../services/ApiService';
import { useRequest } from 'ahooks';


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
  
  const [needSignMessage, setNeedSignMessage] = useState<boolean>(false)
  //
  const [hasPlay, setHasPlay] = useState<boolean>(false)


  const { address, isConnected } = useAccount()
  const dispatch = useAppDispatch()
  const info = useAppSelector((state) => state.user.info)

  const message=`Welcome To Hackmon!`

  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message,
  })


  const {loading:findLoading,  runAsync:findUserFn } = useRequest(() => fethchFn({
    url: FIND_URL,
    address
  }), {
    manual: true
  });

  const { loading,  runAsync:createFn } = useRequest(() => fethchFn({
    url: CEATE_URL,
    address,
    message,
    signature:data
  }), { 
    manual: true
  });

  const createFnRun=()=>{
 createFn()
      .then(res=>res.json())
      .then(async (res) => {
        console.log(res, 'res')
         dispatch(setInfo(res?.user));
         start()
      })
  }

  useEffect(() => {
    if (data&&!isLoading) {
      console.log(data,'message data')
     createFnRun()
    }
  }, [data,isLoading])


   const findUserFetch=()=>{
    findUserFn()
      .then(res => res.json())
      .then(res => {
        console.log(res,'res user')
        if (!res.ok) {
          setNeedSignMessage(true)
        }else{
          dispatch(setInfo(res?.user));
        }
      })
  }

  useEffect(() => {
  
    if (address&&isConnected){
      findUserFetch()
        
    }
  }, [address,isConnected])



  const play = () => {
   

    if(findLoading) return 
    if(needSignMessage){
        signMessage()
    }else{
// createFnRun()
         start()

    }

  }


  const start=()=>{
    let game = window.game?.scene?.keys?.game
    
    if (!game?.myPlayer || !address) return

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
