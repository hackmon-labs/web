// @ts-ignore

import { useAppDispatch, useAppSelector } from '../../hooks'
import { setRpgOpen, setInfo } from '../../stores/UserStore'
import { Modal } from 'antd';
import { useEffect,useState } from 'react';
import { useAccount } from 'wagmi'
import { useRequest } from 'ahooks';
import {FIND_URL,CEATE_URL,ATTACK_URL,ATTACKSTRAT_URL,RECOVER_URL,fethchFn}  from '../services/ApiService';


export default function RpgModal() {
  const { address } = useAccount()
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.user.rpgOpen)
  const info = useAppSelector((state) => state.user.info)

  

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


  const [monsterDetail, setMonsterDetail] = useState({})
  // const [need, setMonsterDetail] = useState({})


 
  


  const handleOk = () => {
    // write?.()
    // dispatch(setRpgOpen(false));
    attack()
  };

  const handleCancel = () => {
    // setIsModalVisible(false);
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

      })
  }

  const attackStart=()=>{
    attackStartFn()
      .then(res => res.json())
      .then(res=>{
        setMonsterDetail(res)
      })
  }

  const recovert=()=>{
    recovertFn()
      .then(res => res.json())
      .then(res => {
        setMonsterDetail(res)
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
    }

  }, [isOpen, dispatch])


  console.log(isOpen, 'isopen')

  const user = monsterDetail?.message 
  const monster = monsterDetail?.message?.monster

  console.log(monster, 'rpgDetail', monsterDetail)

  return (
    <div className='rpgBox'>


      <Modal className='rpgBoxModal' title="" open={isOpen} cancelText="逃跑" okText="攻击" closable={false} maskClosable={false} centered onOk={handleOk} onCancel={handleCancel}>
        {attackLoading||startLoading?'loading':''}
        
        <div onClick={recovert}>使用回血道具</div>
        {user &&<div style={{ marginBottom: 20 }}>

          <div>hackman</div>
          
          <div>血量{user.metadata.hp}/{user.maxHp}</div>
          <div>攻击力{user.minDamage} ~ {user.maxDamage}</div>
        </div>}

        {monster && <div style={{ marginBottom: 20 }}>

          <div>monster</div>

          <div>血量{monster.monsterHp}/{monster.monsterMaxHp}</div>
          <div>攻击力{monster.monsterMinDamage} ~ {monster.monsterMaxDamage}</div>
        </div>}
        {/* <div onClick={attack}>
          攻击
        </div> */}

      </Modal>
    </div>
  );
};