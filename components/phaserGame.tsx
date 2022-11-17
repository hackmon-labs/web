import { useEffect, useRef } from 'react';
import { Types } from 'phaser'
import Main from './scenes/Game'
import Preloader from './scenes/Preloader'
import Forest from './scenes/Forest'



var game = null


export default function PhaserGame() {
  console.log('start1 game')

  useEffect(() => {
    loadGame();
    console.log("load game");
  }, []);

  const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    // parent: 'hackmon-game',
    backgroundColor: '#999',
    pixelArt: true, // Prevent pixel art from becoming blurred when scaled.
    scale: {
      mode: Phaser.Scale.ScaleModes.RESIZE,
      width: window.innerWidth,
      height: window.innerHeight,
      // min: {
      //   width: 800,
      //   height: 600,
      // },
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    autoFocus: true,
    scene: [Preloader, Main,],
    // scene: [Preloader, ],
  }



  const loadGame = async () => {
    if (typeof window !== "object") {
      return;
    }

    game = new Phaser.Game(config);
    game.scene.start("preloader");
    ; (window as any).game = game

  }

  return null;
}


declare global {
  interface Window {
    game: any
  }
}

