import { useAppDispatch, useAppSelector } from '../hooks'
import { setOpen } from '../stores/TalkStore'
import  {Modal}  from 'antd';
import { useEffect } from 'react';


export default function TalkModal() {
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

  console.log(isOpen,'isopen')

  return (
    <>

     
      <Modal title="" visible={isOpen} cancelText="skip" okText="next" closable={false} maskClosable={false} centered onOk={handleOk} onCancel={handleCancel}>
        <div style={{ marginBottom: 20 }}>这是对话</div>

      </Modal>
    </>
  );
};