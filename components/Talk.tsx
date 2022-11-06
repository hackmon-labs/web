import { useAppDispatch, useAppSelector } from '../hooks'
import { setOpen } from '../stores/TalkStore'

import  Modal  from 'react-modal';
import { useEffect } from 'react';


export default function CreatFishNFT() {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.talk.open)


 

  const handleOk = () => {
    // write?.()
    dispatch(setOpen(false));

  };

  const handleCancel = () => {
    // setIsModalVisible(false);
    dispatch(setOpen(false));
    // game.enableKeys()

  };



  return (
    <>

      <Modal isOpen={isOpen}>

        <div style={{ marginBottom: 20 }}>这是对话</div>

      </Modal>
    </>
  );
};