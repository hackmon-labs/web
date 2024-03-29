import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
  constructor() {
    super('preloader');
  }

  preload() {
    this.load.tilemapTiledJSON('tilemap', 'assets/map/new-city.json');

    // TODO 减少体积
    this.load.image('tiles_bg', 'assets/map/new-city.png');

    this.load.spritesheet('adam', 'assets/character/adam.png', {
      frameWidth: 32,
      frameHeight: 48,
    });

    this.load.spritesheet('npc1', 'assets/character/npc1.png', {
      frameWidth: 32,
      frameHeight: 64,
    });

    this.load.spritesheet('drone', 'assets/character/Drone.png', {
      frameWidth: 96,
      frameHeight: 96,
    });

    //  this.load.spritesheet('monster', 'assets/character/monster.jpg', {
    //   frameWidth: 200,
    //   frameHeight: 200,
    // })

    this.load.spritesheet('npc2', 'assets/character/npc2.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
  }

  create() {
    this.scene.run('game');
  }
}
