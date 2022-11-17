import Phaser from 'phaser'

export default class Preloader extends Phaser.Scene {
  private counter = 0

  constructor() {
    super('preloader')
  }

  preload() {
    this.load.tilemapTiledJSON('tilemap', 'assets/map/city.json')

    // this.load.spritesheet('tiles', 'assets/map/Modern_Exteriors_Complete_Tileset.png', {
    //   frameWidth: 32,
    //   frameHeight: 32,
    // });


    this.load.image('tiles_bg', 'assets/map/city.png');
    this.load.image('idle_32x32_6', 'assets/map/idle_32x32_6.png');




   

    this.load.spritesheet('adam', 'assets/character/adam.png', {
      frameWidth: 32,
      frameHeight: 48,
    })

    // this.load.spritesheet('ash', 'assets/character/ash.png', {
    //   frameWidth: 32,
    //   frameHeight: 48,
    // })

    // this.load.spritesheet('lucy', 'assets/character/lucy.png', {
    //   frameWidth: 32,
    //   frameHeight: 48,
    // })

    // this.load.spritesheet('nancy', 'assets/character/nancy.png', {
    //   frameWidth: 32,
    //   frameHeight: 48,
    // })
    this.load.spritesheet('npc1', 'assets/character/npc1.png', {
      frameWidth: 32,
      frameHeight: 64,
    })

    this.load.spritesheet('forestOri', 'assets/character/forestOri.png', {
      frameWidth: 64,
      frameHeight: 128,
    })


     this.load.spritesheet('monster', 'assets/character/monster.jpg', {
      frameWidth: 200,
      frameHeight: 200,
    })

    this.load.spritesheet('npc2', 'assets/character/npc2.png', {
      frameWidth: 32,
      frameHeight: 64,
    })
   
  }

  create() {
    

    this.scene.run('game')
  }
}
