// @ts-ignore

import { useAppDispatch, useAppSelector } from '../../hooks'
import { setRpgOpen, setInfo } from '../../stores/UserStore'
import { Modal,Progress,message } from 'antd';
import { useEffect,useState } from 'react';
import { useAccount } from 'wagmi'
import { useRequest } from 'ahooks';
import {FIND_URL,CEATE_URL,ATTACK_URL,ATTACKSTRAT_URL,RECOVER_URL,fethchFn}  from '../services/ApiService';
import HackerPng from '../../public/assets/imgs/hacker.png'
import MonsterPng from '../../public/assets/imgs/monster.png'
import FramePng from '../../public/assets/imgs/frame.png'
import { Image } from 'next/image';


export default function RpgModal() {
  const { address } = useAccount()
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.user.rpgOpen)
  const info = useAppSelector((state) => state.user.info)

  const [messageApi, contextHolder] = message.useMessage();

  const { runAsync: attackFn, loading: attackLoading } = useRequest(() => fethchFn({
    url: ATTACK_URL,
    token:info?.token
  }), {
    manual: true
  });

  const { runAsync: attackStartFn,loading:startLoading } = useRequest(() => fethchFn({
    url: ATTACKSTRAT_URL,
    token: info?.token
  }), {
    manual: true,
  });

  const { runAsync: recovertFn,  } = useRequest(() => fethchFn({
    url: RECOVER_URL,
    token: info?.token
  }), {
    manual: true,
  });

const key = 'updateHP';
  const openMessage = () => {
    messageApi.open({
      key,
      type: 'loading',
      content: 'Loading...',
    });
    
  };

  const closeMessage=()=>{
    messageApi.open({
        key,
        type: 'success',
        content: 'ok!',
        duration: 2,
      });
  }

  const winMessage=(item)=>{
    const award=item.win=='hacker'?`gold:${item.gold},box:${item.box}`:''
    messageApi.open({
        key,
        type: 'success',
        content: `${item.win} win!${award}`,
        duration: 3,
      });

      setTimeout(() => {
    dispatch(setRpgOpen(false));
     
    }, 3000);

  }

  useEffect(() => {
    if(startLoading||attackLoading){
      openMessage()
    }else{
      closeMessage()
    }

  },[startLoading,attackLoading])

  const [monsterDetail, setMonsterDetail] = useState({})
  // const [need, setMonsterDetail] = useState({})

  const [percentMonster, setPercentMonster] = useState(0)
  const [percentHacker, setPercentHacker] = useState(0)
 
  
  const updateHp=(res)=>{
    setPercentMonster(res.monster?.monsterHp)
    setTimeout(()=>{
    setPercentHacker(res.metadata?.hp)
    },800)
  }

  const handleOk = () => {
    // write?.()
    // dispatch(setRpgOpen(false));



    attack()
  };

  const handleCancel = () => {
    // setIsModalVisible(false);
    // dispatch(setInfo(monsterDetail.message));

    setMonsterDetail(null)

    dispatch(setRpgOpen(false));
    // game.enableKeys()


  };

  const attack = () => {
    console.log(info, 'info')
    attackFn()
      .then(res=>res.json())
      .then(res => {
        console.log(res, 'res attack')

        setMonsterDetail(res)
        updateHp(res.message)

        if(res.message?.win){
          winMessage(res.message)
        }
      })

  }

  const attackStart=()=>{
    attackStartFn()
      .then(res => res.json())
      .then(res=>{
        // setPercentMonster(res.)
        setMonsterDetail(res)
        updateHp(res.message)
       
      })
  }

  const recovert=()=>{
    recovertFn()
      .then(res => res.json())
      .then(res => {
        setMonsterDetail(res)
        updateHp(res.message)

      })
  }

  useEffect(() => {
    if (isOpen){
      
    // runAsync()
    //   .then(res=>res.json())
    //   .then(async (res) => {
    //     console.log(res, 'res')
    //     await dispatch(setInfo(res?.user));
    //    await attackStart()
    //   })
      attackStart()
    }

  }, [isOpen, dispatch])



  const user = monsterDetail?.message 
  const monster = monsterDetail?.message?.monster

  console.log(monster, 'rpgDetail', monsterDetail)

  return (
    <div className='rpgBox'>
      {contextHolder}

      <Modal  footer={false} width={800}  getContainer={false} className='rpgBoxModal' title="" open={isOpen} closable={false} maskClosable={false} centered onOk={handleOk} onCancel={handleCancel}>
        <div  style={{
          backgroundImage:`url(${FramePng.src})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          padding: '70px'
        }}>
        
        {monster && <div className='monsterBox' style={{ marginBottom: 20 }}>
          <div>
            <div className="npcTitle" >monster</div>
            <div  className="font20 width400">
              <Progress strokeColor="red" showInfo={false} format={(percent) => percent+'/'+monster.monsterMaxHp +'hp'} percent={(percentMonster/monster.monsterMaxHp)*100} status="active" />
              <span>HP : {percentMonster}/{monster.monsterMaxHp}</span>
              </div>
            <div  className="font20 ">ATK : {monster.monsterMinDamage} - {monster.monsterMaxDamage}</div>
          </div>

          <div className='monsterPng'><img src={MonsterPng.src} /></div>
        </div>}
        {user &&<div  className='hackerBox'>

          <div className='monsterPng'><img src={HackerPng.src} style={{height:256}} /></div>
          <div className="ml50">
            <div  className="npcTitle" >> hackman</div>
            
            <div  className="font20 width500">
                <Progress showInfo={false}  percent={(percentHacker / (user.maxHp + user.addMaxHp))*100} status="active" />
              <span>HP : {percentHacker}/{user.maxHp+ user.addMaxHp} </span>

            </div>
              <div className="font20 ">ATK : {user.minDamage + user.addMaxAtk} - {user.maxDamage+user.addMaxAtk}</div>

            <div className="action ">
            <div onClick={attack} className="font20 actionItem1">attack</div> 
            <div onClick={recovert} className="font20 actionItem1" style={{color:'blue'}}>recover {user.blood}</div> 
            <div onClick={handleCancel} className="font20 actionItem2">Run away</div> 

            </div>
          </div>

        </div>}

       
       
        </div>

      </Modal>
    </div>
  );
};