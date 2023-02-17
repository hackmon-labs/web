/* eslint-disable */

import React, { useState, useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '../../hooks'

import { setLoggedIn } from '../../stores/UserStore'
import {  setInfo } from '../../stores/UserStore'

import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from '../../styles/game.module.css'
import { useAccount, useSignMessage } from 'wagmi'
import { FIND_URL, CEATE_URL,ATTACKSTRAT_URL,fethchFn}  from '../services/ApiService';
import { useRequest } from 'ahooks';
import { Alert, message } from 'antd';
const antdMsg = message
// message
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

  // address

  const [noLogin, setNoLogin] = useState<boolean>(false)
  


  const { address, isConnected } = useAccount()
  const dispatch = useAppDispatch()
  const info = useAppSelector((state) => state.user.info)

  const message=`Welcome To Hackmon! \nNonce：${Math.floor(Math.random()*10000)}`

  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message,
  })


  const {loading:findLoading,  runAsync:findUserFn } = useRequest(() => fethchFn({
    url: FIND_URL,
    address
  }), {
    manual: true
  });

  const { runAsync: attackStartFn, loading: startLoading } = useRequest(() => fethchFn({
    url: ATTACKSTRAT_URL,
    token: info?.token
  }), {
    manual: true,
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

          // attackStartFnRun()
          dispatch(setInfo(res?.user));
        }
      })
  }

  const attackStartFnRun=()=>{
    attackStartFn()
      .then(res => res.json())
      .then(async (res) => {
        console.log(res, 'res')
        dispatch(setInfo(res?.user));
        // start()
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

  const loginBefore=()=>{
    // setNoLogin(true)

    // setTimeout(() => {  
    //   setNoLogin(false)

    // }, 3000);

    antdMsg.error('Please link wallet');
  }


  const start=()=>{
    let game = window.game?.scene?.keys?.game
    
    if (!game?.myPlayer || !address) return loginBefore()

    game.registerKeys()
    game.myPlayer.setPlayerName(formatAddress(address as string))
    game.myPlayer.setPlayerTexture('adam')
    setHasPlay(true)
  }






  return (

    <div>
      {/* {noLogin&&<Alert
        message="Error"
        description="This is an error message about copywriting."
        type="error"
        showIcon
      />} */}
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
