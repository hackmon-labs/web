import Phaser from 'phaser'

export default class Preloader extends Phaser.Scene {
  private counter = 0

  constructor() {
    super('preloader')
  }

  preload() {
    this.load.tilemapTiledJSON('tilemap', 'assets/map/city2.json')

    this.load.spritesheet('tiles', 'assets/map/Modern_Exteriors_Complete_Tileset.png', {
      frameWidth: 32,
      frameHeight: 32,
    });


    this.load.image('tiles_bg', 'assets/map/Modern_Exteriors_Complete_Tileset_32x32.png');
    



   

    this.load.spritesheet('adam', 'assets/character/adam.png', {
      frameWidth: 32,
      frameHeight: 48,
    })

    this.load.spritesheet('ash', 'assets/character/ash.png', {
      frameWidth: 32,
      frameHeight: 48,
    })

    this.load.spritesheet('lucy', 'assets/character/lucy.png', {
      frameWidth: 32,
      frameHeight: 48,
    })

    this.load.spritesheet('nancy', 'assets/character/nancy.png', {
      frameWidth: 32,
      frameHeight: 48,
    })

   
  }

  create() {
    

    this.scene.run('game')
  }
}
