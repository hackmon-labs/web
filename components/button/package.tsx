import { useAppDispatch, useAppSelector } from '../../hooks'
import { setPackageOpen } from '../../stores/UserStore'
import { Modal, message, Card,Checkbox } from 'antd';
import { useEffect,useState } from 'react';
import { useAccount, useContractWrite, useContractRead } from 'wagmi'
import { useRequest } from 'ahooks';
import {FIND_URL,CEATE_URL,ATTACK_URL,ATTACKSTRAT_URL,GETNFTS_URL,fethchFn,UPDATEITEM_URL}  from '../services/ApiService';
import FramePng from '../../public/assets/imgs/frame.png'
import mintABI from '../abi/VRFMINT.json'

const { Meta } = Card;
export default function PackageModal() {
  const { address } = useAccount()

  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.user.packageOpen)
  const info = useAppSelector((state) => state.user.info)
  const [messageApi, contextHolder] = message.useMessage();
  const [infoDetail, setInfoDetail] = useState({})


  const { runAsync: getInfo, loading: attackLoading } = useRequest(() => fethchFn({
    url: ATTACKSTRAT_URL,
    token:info?.token
  }), {
    manual: true
  });

   const { runAsync: getNFTS, loading: nftsLoading } = useRequest(() => fethchFn({
    url: GETNFTS_URL,
    token:info?.token
  }), {
    manual: true
  });

  const { runAsync: updateItem, loading: updateItemLoading } = useRequest(() => fethchFn({
    url: UPDATEITEM_URL,
    token:info?.token,
    tokens:checkedValues?.map(item=>nfts.find(j=>item==j.tokenId))
  }), {
    manual: true
  });



  // const { config } = usePrepareContractWrite({
  //   address: '0x52bF793b02810469902BC87a47A4142c0b2264BF',
  //   abi: mintABI,
  //   functionName: 'getAmount',
  // })
  // const { data, isLoading, isSuccess, write } = useContractWrite(config)
  const { data, isLoading, isSuccess, write  } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: '0x52bF793b02810469902BC87a47A4142c0b2264BF',
    abi: mintABI,
    functionName: 'getAmount',
  })

  const { data:mintRes, isLoading:BoxLoading, isSuccess:boxSuccess, write:openChainBoxFn  } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: '0x52bF793b02810469902BC87a47A4142c0b2264BF',
    abi: mintABI,
    functionName: 'mint',
  })

  const { data:readData,  isLoading:isReadLoading } = useContractRead({
    address: '0x52bF793b02810469902BC87a47A4142c0b2264BF',
    abi: mintABI,
    functionName: 'canMintAmount',
    args: [address],
  })

  const [nfts, setNFTs] = useState([])
  const [checkedValues,setCheckedValues] = useState([])

  const openChainBox=()=>{
    openChainBoxFn?.()
  }



  useEffect(() => {
    if (isOpen){
      
    getInfo()
      .then(res => res.json())
      .then(res=>{
        setInfoDetail(res?.message)
        setCheckedValues(res?.message?.tokenIds)
      })

      getNFTS()
      .then(res => res.json())
      .then(res=>{
        console.log(res,'nfts')
        setNFTs(res?.ownedNfts)
       
      })

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

  const closeMessage=()=>{
    messageApi.open({
        key,
        type: 'success',
        content: 'ok!',
        duration: 2,
      });
  }

  useEffect(() => {
    if(isLoading||BoxLoading||updateItemLoading){
      openMessage()
    }
    if (isSuccess || boxSuccess||!updateItemLoading){
      closeMessage()
    }


  }, [isSuccess, isLoading, BoxLoading, boxSuccess,updateItemLoading])
  const boxOnChain=()=>{
    write?.()
  }
 

  const handleCancel=async()=>{
    await updateItem()
    await dispatch(setPackageOpen(false));

  }
const onChange = (checkedValues) => {
  console.log('checked = ', checkedValues);
  setCheckedValues(checkedValues)
};

 
  console.log(infoDetail)

  return (
    <>
      {contextHolder}
      <Modal   width={800} height={500}  getContainer={false} footer={null} className='rpgBoxModal' title="" open={isOpen} closable={false} maskClosable={true} centered onCancel={handleCancel}>
      <div  style={{
                backgroundImage:`url(${FramePng.src})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '100% 100%',
                padding: '70px'
              }}>
     
     
        <div  >
          <div style={{fontSize:30,color:'gold'}}>
            gold:{infoDetail?.gold}
          </div>
          <div style={{fontSize:30,color:'gold'}} >
            box(server):{infoDetail?.box}
            <span className="boxOnChain" onClick={boxOnChain}>Sync to the chain</span>
          </div>
           <div style={{fontSize:30,color:'gold'}} >
            box(chain):{readData}
            <span className="boxOnChain" onClick={openChainBox}>open NFT</span>
          </div>
          <div style={{fontSize:30,color:'gold'}}>
            blood:{infoDetail?.blood}
          </div>

          <div style={{display:'flex'}}>
              <Checkbox.Group style={{ width: '100%' }} value={checkedValues} onChange={onChange}>
          {nfts?.map(nft=>(
            <div>
            <Checkbox value={nft.tokenId}>{nft.title}</Checkbox>
            <Card
              hoverable
              style={{ width: 200 }}
              cover={<img alt="nft" src={nft?.media?.[0]?.gateway} />}
            >
              <Meta title={nft.title} description={nft?.rawMetadata?.attributes?.map(item => `${item.trait_type}:${item.value}\n`)} />
            </Card>
            </div>
          ))}
          </Checkbox.Group>
          </div>
      </div>
      </div>
      </Modal>

    </>
  );
};