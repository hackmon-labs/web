/* eslint-disable */
import { useAppDispatch, useAppSelector } from '../hooks'
import { setOpen } from '../stores/TalkStore'
import { Modal, Skeleton, Input } from 'antd';
import { useRequest } from 'ahooks';
import { useEffect, useState, useRef,useMemo } from 'react';
import FramePng from '../public/assets/imgs/frame.png'
import { TALK_URL, fethchFn } from './services/ApiService';
import { v4 as uuidv4 } from 'uuid';

const NPC = 0
const HACKMAN = 1


export default function TalkModal() {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.talk.open)
  const info = useAppSelector((state) => state.user.info)
  const ref = useRef()
  const [textList, setTextList] = useState([])
  const [text, setText] = useState('')
  // const [uuid, setUuid] = useState()


  const { runAsync: talkFn, loading: talkLoading, data } = useRequest((uuid) => fethchFn({
    url: TALK_URL,
    token: info?.token,
    text,
    talkUuid:uuid
  }), {
    manual: true,

  });


  const handleOk = () => {
    // write?.()
    dispatch(setOpen(false));

  };

  const handleCancel = () => {
    // setIsModalVisible(false);
    dispatch(setOpen(false));
    console.log(game, 'game')
    // game.scene.npcs.forEach(npc=>
    //       npc.body.enable=true
    //       ) 

  };

  const talkFnRun = () => {
    talkFn(ref.current)
      .then(res => res.json())
      .then(async (res) => {

        setTextList(old => {
          return [...old].concat({
            time: new Date(),
            message: res.message,
            type: NPC
          })
        })

      })
  }

  useEffect(() => {
    if (isOpen) {
      setTextList([])
      ref.current=uuidv4()
      talkFnRun()
    }


  }, [isOpen])



  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    console.log('Change:', e.target.value);

    setText(e.target.value)
  };

  const onPressEnter = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!e.target.value) return
   

    setTextList(old => {
      return [...old].concat({
        time: new Date(),
        message: e.target.value,
        type: HACKMAN
      })
    })
    talkFnRun()
    setText('')

  };


 const renderTalk=useMemo(()=>{
  return textList?.map((item, i) => {
            if (item.type == NPC) {
              return (
                <div className='chat-message chat-message-left ' key={`${i}` + item.time.toString()}>{item.message}</div>
              )
            } else {
              return (
                <div className='chat-message chat-message-right' key={`${i}` + item.time.toString()}>{item.message}</div>
              )
            }
          })
 },[textList.length])





  return (
    <>

      <Modal width={800} height={500} getContainer={false} footer={null} className='rpgBoxModal' title="" open={isOpen} closable={false} maskClosable={true} centered onCancel={handleCancel}>
        <div style={{
          backgroundImage: `url(${FramePng.src})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          padding: '70px',

        }}>
          <div style={{ marginBottom: 20 }} className="chat-messages" >{renderTalk}
            {talkLoading && <Skeleton active />}</div>
          
          {<Input value={text} onChange={onChange} onPressEnter={onPressEnter} />}
        </div>
      </Modal>
    </>
  );
};