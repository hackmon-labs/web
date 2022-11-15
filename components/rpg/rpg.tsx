/* eslint-disable react-hooks/exhaustive-deps */
import { useAppDispatch, useAppSelector } from '../../hooks'
import { setRpgOpen, setInfo } from '../../stores/UserStore'
import { Modal } from 'antd';
import { useEffect } from 'react';
import { useAccount } from 'wagmi'
import { useRequest } from 'ahooks';

const url = 'http://localhost:2567/api/getUser/findOrCreate'
const url2 = 'http://localhost:2567/api/hackmon/attack'

const fethchFn = (params) => {
  const { url,token, ...otherParams } = params
  return fetch(url, {
    method: 'post',
    headers: token?{
      'Content-Type': 'application/json',
      'Authorization':`Bearer ${token}`
    }:{
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...otherParams
    })
  })
}

export default function RpgModal() {
  const { address } = useAccount()
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.user.rpgOpen)
  const info = useAppSelector((state) => state.user.info)
  console.log(address)
  const { loading, run, runAsync } = useRequest(() => fethchFn({
    url,
    address
  }), {
    manual: true
  });

  const { runAsync: attackFn } = useRequest(() => fethchFn({
    url: url2,
    damage:11,
    to:'moralis',
    token:info?.token
  }), {
    manual: true
  });


  const handleOk = () => {
    // write?.()
    dispatch(setRpgOpen(false));

  };

  const handleCancel = () => {
    // setIsModalVisible(false);
    dispatch(setRpgOpen(false));
    // game.enableKeys()

  };

  const attack = () => {
    console.log(info, 'info')
    attackFn()
      .then(res=>res.json())
      .then(res => {
        console.log(res, 'res attack')

      })
  }

  useEffect(() => {
    if (isOpen){
      
    runAsync()
      .then(res=>res.json())
      .then((res) => {
        console.log(res, 'res')
        dispatch(setInfo(res?.user));
      })
    }

  }, [isOpen, runAsync, dispatch])


  console.log(isOpen, 'isopen')

  return (
    <div className='rpgBox'>


      <Modal className='rpgBoxModal' title="" open={isOpen} cancelText="skip" okText="next" closable={false} maskClosable={false} centered onOk={handleOk} onCancel={handleCancel}>
        <div style={{ marginBottom: 20 }}>这是rpg {address}</div>
        <div onClick={attack}>
          攻击
        </div>

      </Modal>
    </div>
  );
};