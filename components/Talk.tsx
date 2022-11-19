import { useAppDispatch, useAppSelector } from '../hooks'
import { setOpen } from '../stores/TalkStore'
import  {Modal}  from 'antd';
import { useEffect } from 'react';
import FramePng from '../public/assets/imgs/frame.png'


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
    console.log(game,'game')
    // game.scene.npcs.forEach(npc=>
    //       npc.body.enable=true
    //       ) 

  };

  // console.log(isOpen,'isopen')


  const textlist=[
    `OlympusDAO confirmed the exploit on its Discord channel today. There, it stated that the attacker “was able to withdraw roughly 30K OHM ($300K)” but that most of the project’s other funds remained safe. 20221021`,
    `Attacker can perform price manipulation by transferring HEALTH token 999 times to reduce HEALTH token in uniswap pair. 20221020`,
    `Attacker can input empty data into _r, _s and _v to bypass all checks to mint BEGO token. 20221020`,
    `Due _addre is controllable. Attacker can call setToken() to set fake token created by self.

1.setToken to faketoken

2.Deposit faketoken

3.setToken to HPAY

3.withdraw.  over 20221018`,
`Attacker can directly call Flashloan with userData “0x307832” which is bytes “0x2” from balancer and set EFLeverVault as recipient to trigger  _withdraw(loan_amount, fee_amount);  to make vault retain enough ETH. Then attacker can call withdraw to drain out the ETH in L429. 20221014`,
`Root cause: Insecure use balanceOf to calculate price is vulnerable to price manipulation over flash loan.

The calim Function use getPrice() in ASK Token Contract

Vulnerable code snippet:

Incorrect price calculation via balanceOf. 20221012`,
`Root cause: arbitrary external call vulnerability.

Since data is controllable by an attacker, so he can perform arbitrary external calls via functionCallWithValue. In this incident, the attacker sends funds out over transferfrom function. 20221011`,
`Root cause: Economic issue 

The vulnerability stemmed from the thin liquidity on the exchange market between MNGO and the USDC stablecoin, which was used as the price reference for a MNGO perpetual swap. 20221011`
  ]


  const text=textlist[Math.floor(Math.random()*8)]


  return (
    <>

      <Modal   width={800} height={500}  getContainer={false} footer={null} className='rpgBoxModal' title="" open={isOpen} closable={false} maskClosable={true} centered onCancel={handleCancel}>
      <div  style={{
          backgroundImage:`url(${FramePng.src})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
          padding: '70px'
        }}>
        <div style={{ marginBottom: 20 }}>{text}</div>
</div>
      </Modal>
    </>
  );
};