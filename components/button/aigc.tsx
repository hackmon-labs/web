/* eslint-disable */
import { useAppDispatch, useAppSelector } from '../../hooks'
import { setAigcOpen } from '../../stores/UserStore'
import { Modal, message, Card, Checkbox,Input } from 'antd';
import { useEffect, useState } from 'react';
import { useAccount, useContractWrite, useContractRead } from 'wagmi'
import { useRequest } from 'ahooks';
import { FIND_URL, CEATE_URL, ATTACK_URL, ATTACKSTRAT_URL, GETNFTS_URL, fethchFn, UPDATEITEM_URL, BUYBLOOD_URL } from '../services/ApiService';
import FramePng from '../../public/assets/imgs/frame.png'
import mintABI from '../abi/VRFMINT.json'

const { Meta } = Card;
export default function AigcModal() {
  const { address } = useAccount()

  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.user.aigcOpen)
  const info = useAppSelector((state) => state.user.info)
  const [messageApi, contextHolder] = message.useMessage();
  const [infoDetail, setInfoDetail] = useState({})
  const [text, setText] = useState('')



  const { runAsync: getInfo, loading: attackLoading } = useRequest(() => fethchFn({
    url: ATTACKSTRAT_URL,
    token: info?.token
  }), {
    manual: true
  });

  const { runAsync: getNFTS, loading: nftsLoading } = useRequest(() => fethchFn({
    url: GETNFTS_URL,
    token: info?.token
  }), {
    manual: true
  });

  const { runAsync: updateItem, data: updateData, loading: updateItemLoading } = useRequest(() => fethchFn({
    url: UPDATEITEM_URL,
    token: info?.token,
    tokens: checkedValues?.map(item => nfts.find(j => item == j.tokenId))
  }), {
    manual: true
  });

  const { runAsync: buyBlood, data: butData, loading: BuyBloodLoading } = useRequest(() => fethchFn({
    url: BUYBLOOD_URL,
    token: info?.token,

  }), {
    manual: true
  });



  // const { config } = usePrepareContractWrite({
  //   address: '0x52bF793b02810469902BC87a47A4142c0b2264BF',
  //   abi: mintABI,
  //   functionName: 'getAmount',
  // })
  // const { data, isLoading, isSuccess, write } = useContractWrite(config)
  const { data, isLoading, isSuccess, write } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: '0x52bF793b02810469902BC87a47A4142c0b2264BF',
    abi: mintABI,
    functionName: 'getAmount',
  })

  const { data: mintRes, isLoading: BoxLoading, isSuccess: boxSuccess, write: openChainBoxFn } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: '0x52bF793b02810469902BC87a47A4142c0b2264BF',
    abi: mintABI,
    functionName: 'mint',
  })

  const { data: readData, isLoading: isReadLoading } = useContractRead({
    address: '0x52bF793b02810469902BC87a47A4142c0b2264BF',
    abi: mintABI,
    functionName: 'canMintAmount',
    args: [address],
  })

  const [nfts, setNFTs] = useState([])
  const [checkedValues, setCheckedValues] = useState([])

  const openChainBox = () => {
    openChainBoxFn?.()
  }



  useEffect(() => {
    if (isOpen) {

      // getInfo()
      //   .then(res => res.json())
      //   .then(res => {
      //     setInfoDetail(res?.message)
      //     setCheckedValues(res?.message?.tokenIds)
      //   })

      // getNFTS()
      //   .then(res => res.json())
      //   .then(res => {
      //     console.log(res, 'nfts')
      //     setNFTs(res?.ownedNfts)

      //   })

    }

  }, [isOpen, dispatch])


  const key = 'updateBox';
  const openMessage = () => {
    messageApi.open({
      key,
      type: 'loading',
      content: 'Loading...',
    });

  };

  const closeMessage = () => {
    messageApi.open({
      key,
      type: 'success',
      content: 'ok!',
      duration: 2,
    });
  }

  useEffect(() => {
    if (isLoading || BoxLoading || updateItemLoading || BuyBloodLoading) {
      openMessage()
    }
    if (isSuccess || boxSuccess || updateData || butData) {
      closeMessage()
    }


  }, [isSuccess, isLoading, BoxLoading, boxSuccess, updateItemLoading, updateData, BuyBloodLoading, butData])
  const boxOnChain = () => {
    write?.()
  }


  const handleCancel = async () => {
    await updateItem()
    await dispatch(setAigcOpen(false));

  }
  const onChange = (checkedValues) => {
    console.log('checked = ', checkedValues);
    setCheckedValues(checkedValues)
  };

  const buyBloodFn = () => {
    buyBlood()
      .then(res => res.json())
      .then(res => setInfoDetail(res?.message))
  }

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    console.log('Change:', e.target.value);

    setText(e.target.value)
  };

  const onPressEnter = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!e.target.value) return


    // setTextList(old => {
    //   return [...old].concat({
    //     time: new Date(),
    //     message: e.target.value,
    //     type: HACKMAN
    //   })
    // })
    // talkFnRun()
    setText('')

  };

  console.log(infoDetail)

  return (
    <>
      {contextHolder}
      <Modal width={800} height={500} getContainer={false} footer={null} className='rpgBoxModal' title="" open={isOpen} closable={false} maskClosable={true} centered onCancel={handleCancel}>
        <div style={{
          backgroundImage: `url(${FramePng.src})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          padding: '70px'
        }}>
          <div>生成关键词 
            {<Input value={text} onChange={onValueChange} onPressEnter={onPressEnter} />}
            </div>


        </div>




      </Modal>

    </>
  );
};