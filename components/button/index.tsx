import { useAppDispatch, useAppSelector } from '../../hooks'
import { setPackageOpen } from '../../stores/UserStore'
import { Modal } from 'antd';
import { useEffect } from 'react';
import PackagePng from '../../public/assets/imgs/package.jpg'


export default function ButtonModal() {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.user.rpgOpen)
  const info = useAppSelector((state) => state.user.info)




  // const handleOk = () => {
  //   // write?.()
  //   dispatch(setOpen(false));

  // };

  // const handleCancel = () => {
  //   // setIsModalVisible(false);
  //   dispatch(setOpen(false));
  //   // game.enableKeys()

  // };

  const openPackage=()=>{
    dispatch(setPackageOpen(true));

  }

  


  return (
    <>


      {/* <Modal title="" open={isOpen} cancelText="skip" okText="next" closable={false} maskClosable={false} centered onOk={handleOk} onCancel={handleCancel}>
        <div style={{ marginBottom: 20 }}>这是对话</div>

      </Modal> */}
     
        <div style={{position:'fixed',left:20,top:20}} >
        <div className='package' onClick={openPackage}><img src={PackagePng.src} /></div>

          {/* <div style={{fontSize:30,color:'gold'}}>
            gold:{info?.user?.gold}
          </div>
          <div style={{fontSize:30,color:'gold'}} onClick={openRpg}>box:{info?.user?.box} */}
       {/* { open rpg} */}

      </div>
    </>
  );
};