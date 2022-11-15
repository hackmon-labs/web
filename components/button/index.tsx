import { useAppDispatch, useAppSelector } from '../../hooks'
import { setRpgOpen } from '../../stores/UserStore'
import { Modal } from 'antd';
import { useEffect } from 'react';


export default function TalkModal() {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.user.rpgOpen)




  // const handleOk = () => {
  //   // write?.()
  //   dispatch(setOpen(false));

  // };

  // const handleCancel = () => {
  //   // setIsModalVisible(false);
  //   dispatch(setOpen(false));
  //   // game.enableKeys()

  // };

  const openRpg=()=>{
    dispatch(setRpgOpen(true));

  }

  const openForest=()=>{
    // dispatch(setRpgOpen(true));
    
    console.log(window.game,'window.game')
    // window.game?.scene?._start(window.game?.scene?.keys?.forest)
  }

  console.log(isOpen, 'isopen')

  return (
    <>


      {/* <Modal title="" open={isOpen} cancelText="skip" okText="next" closable={false} maskClosable={false} centered onOk={handleOk} onCancel={handleCancel}>
        <div style={{ marginBottom: 20 }}>这是对话</div>

      </Modal> */}
      <div style={{position:'fixed',left:20,top:20}} onClick={openRpg}>
        open rpg
      </div>
      <div style={{ position: 'fixed', left: 20, top: 60 }} onClick={openForest}>
        forest
      </div>
    </>
  );
};