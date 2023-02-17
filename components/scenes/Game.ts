import Phaser from 'phaser'
// @ts-ignore

import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from '../anims/CharacterAnims'

import Item from '../items/Item'
import '../class/MyPlayer'
import '../class/OtherPlayer'
import MyPlayer from '../class/MyPlayer'
import PlayerSelector from '../class/PlayerSelector'
import Network from '../services/Network'
import { IPlayer } from '../types/IOfficeState'
import OtherPlayer from '../class/OtherPlayer'

import store from '../../stores'
import { setConnected,setRpgOpen } from '../../stores/UserStore'
import { setFocused, setShowChat } from '../../stores/ChatStore'
import { setOpen } from '../../stores/TalkStore';

interface moveKeysType {
  W: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
}

export default class Game extends Phaser.Scene {
  network!: Network
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys | moveKeysType
  // private map!: Phaser.Tilemaps.Tilemap
  myPlayer!: MyPlayer
  private playerSelector!: Phaser.GameObjects.Zone
  private otherPlayers!: Phaser.Physics.Arcade.Group
  private otherPlayerMap = new Map<string, OtherPlayer>()
  computerMap = new Map<string, Item>()
  moving: boolean
  monsters: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[]
  npcs: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[]
  lastPokemonMoveTime:number
  drone: Phaser.GameObjects.Sprite
  tween: Phaser.Tweens.Tween

  constructor() {
    super('game')
  }

  registerKeys() {
    this.cursors ={
      ...this.input.keyboard.createCursorKeys(),
      ...this.input.keyboard.addKeys('W,S,A,D')
    } 
   
    this.input.keyboard.disableGlobalCapture()
    this.input.keyboard.on('keydown-ENTER', (event) => {
      store.dispatch(setShowChat(true))
      store.dispatch(setFocused(true))
    })
    this.input.keyboard.on('keydown-ESC', (event) => {
      store.dispatch(setShowChat(false))
    })
    store.dispatch(setFocused(false))

    this.lastPokemonMoveTime=0
  }

  disableKeys() {
    this.input.keyboard.enabled = false
  }

  enableKeys() {
    this.input.keyboard.enabled = true
  }

  init() {
    this.network = new Network()
  }

  async create() {
    // initialize network instance (connect to server)
    if (!this.network) {
      throw new Error('server instance missing')
    }
    await this.network.join()
    store.dispatch(setConnected(true))

    this.scene.stop('preloader')

    createCharacterAnims(this.anims)

    const map = this.make.tilemap({ key: 'tilemap' })

    let FloorAndGround = map.addTilesetImage('new-city', 'tiles_bg', 32, 32, 0, 0);
    const Walls = map.createLayer('floor', FloorAndGround, 0, 0);

    const groundLayer = map.createLayer('Ground', FloorAndGround, 0, 0);
    const Buildings = map.createLayer('build', FloorAndGround, 0, 0);
    const land = map.createLayer('nomovebom', FloorAndGround, 0, 0);
    const land2 = map.createLayer('nomove', FloorAndGround, 0, 0);
    // groundLayer.setCollisionByProperty({
    //   collides: true
    // })

    Walls.setCollisionByProperty({
      collides: true
    })
    
    Buildings.setCollisionByProperty({
      collides: true
    })
    land.setCollisionByProperty({
      collides: true
    })
    land2.setCollisionByProperty({
      collides: true
    })
    
    const Top = map.createLayer('Top', FloorAndGround, 0, 0);
    // Top.setDepth(1000000) 

    this.myPlayer = this.add.myPlayer(705, 500, 'adam', this.network.mySessionId)

    this.playerSelector = new PlayerSelector(this, 0, 0, 16, 16)

    this.items = this.physics.add.staticGroup({ classType: Item })
    

    this.otherPlayers = this.physics.add.group({ classType: OtherPlayer })

    this.cameras.main.zoom = 1.3
    this.cameras.main.startFollow(this.myPlayer, true)

    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], Walls )
    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], land)
    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], Buildings)
    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], land2)
    

    const NPCPoints = map.filterObjects(
      "NPC",
      (obj) => obj.name === "NPCPoint"
    );

    this.npcs = NPCPoints.map(npc =>
      {
      return this.physics.add.sprite(npc.x, npc.y, 'npc1', 3).setScale(1)

    
    });
    this.anims.create({
      key:'npc',
      frames:this.anims.generateFrameNumbers('npc1',{frames:[0,1,2,3]}),
      frameRate:4,
    })

    this.drone = this.physics.add.sprite(705, 500, 'drone',1).setScale(0.4);
    this.drone.setOrigin(0.5);

    this.tween = this.tweens.add({
      targets: this.drone,
      x: this.myPlayer.x,
      y: this.myPlayer.y,
      duration: 5000,
      yoyo: true,
      repeat: -1
    });
    // this.time.env
    // this.time.addEvent({
    //   delay:3000,
    //   callback: this.droneMove,
    //   loop:true
    // })


    // this.animations.add('up', [0, 1, 2, 3], 10, true);
    // npc.animations.add('down', [4, 5, 6, 7], 10, true);
    // npc.animations.add('left', [8, 9, 10, 11], 10, true);
    // npc.animations.add('right', [12, 13, 14, 15], 10, true);
    // return arr

    this.npcs.forEach(npc => {
      npc.body.setSize(npc.width * 1.5, npc.height*1.5)
      // npc.body.anim
      // npc.anims.create({
      //   key:'top',
      //   frameRate:1,
      //   repeat:-1
      // })
      // npc.anims.create({
      //   key: 'right',
      //   frameRate: 0,
      //   repeat: -1
      // })
      // npc.anims.create({
      //   key: 'left',
      //   frameRate: 2,
      //   repeat: -1
      // })
      // npc.anims.create({
      //   key: 'bottom',
      //   frameRate: 3,
      //   repeat: -1
      // })
      // 
      // this.physics.(npc,this.myPlayer,100)
    });

    this.physics.collide(this.npcs, Walls);
    this.physics.collide(this.npcs, land);
    this.physics.collide(this.npcs, Buildings);

    this.time.addEvent({
      delay:3000,
      callback:this.npcMove,
      // callback:()=>{
      //   this.npcs.forEach(npc => {
      //     npc.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
      //   })
      // },
      loop:true
    })

    // this.physics.add.collider([this.myPlayer, this.npcs], Buildings)


    this.physics.add.overlap([this.myPlayer, this.myPlayer.playerContainer], this.npcs,this.npcTalk);


    const MonsterPoints = map.filterObjects(
      "Monsters",
      (obj) => obj.name === "monster"
    );

    this.monsters = MonsterPoints.map(item => {
      return this.physics.add.sprite(item.x, item.y, 'npc2', 3).setScale(1)
    });

    this.monsters.forEach(item => {
      item.body.setSize(item.width * 1.5, item.height * 1.5)

    });
    // this.time.addEvent({
    //   delay: 3000,
    //   callback: this.monsterMove,
      
    //   loop: true
    // })

    this.physics.add.overlap([this.myPlayer, this.myPlayer.playerContainer], this.monsters, this.rpgTalk);



    // const ForestPoints = map.filterObjects(
    //   "Forest",
    //   (obj) => obj.name === "forestPoint"
    // );

    // this.forestPoint= ForestPoints.map(item =>
    //   {
    //   return this.physics.add.sprite(item.x, item.y, 'forestOri', 0).setScale(1)
    // });

    // this.physics.add.overlap([this.myPlayer, this.myPlayer.playerContainer], this.forestPoint,this.goForest);


   

    this.network.onPlayerJoined(this.handlePlayerJoined, this)
    this.network.onPlayerLeft(this.handlePlayerLeft, this)
    this.network.onPlayerUpdated(this.handlePlayerUpdated, this)
    this.network.onChatMessageAdded(this.handleChatMessageAdded, this)
  }

  droneMove=()=>{
    // this.drone
      this.physics.moveToObject(this.myPlayer,this.drone, 100)

  }

  npcMove=()=>{
    this.npcs.forEach((enemy) => {
      const randNumber = Math.floor((Math.random() * 4) + 1);
      const velocityValue=50
      switch (randNumber) {
        case 1:
          enemy.body.setVelocityX(velocityValue);
          
          break;
        case 2:
          enemy.body.setVelocityX(-velocityValue);

          break;
        case 3:
          enemy.body.setVelocityY(-velocityValue);
          break;
        case 4:
          enemy.body.setVelocityY(velocityValue);
          break;
        default:
          enemy.body.setVelocityX(0);
      }
    });
    setTimeout(() => {
      this.npcs.forEach(npc=>{
        npc.body.setVelocityX(0)
        npc.body.setVelocityY(0)
    })
    }, 1000);
  }

  monsterMove = () => {
    this.monsters.forEach((enemy) => {
      const randNumber = Math.floor((Math.random() * 4) + 1);
      const velocityValue = 50
      switch (randNumber) {
        case 1:
          enemy.body.setVelocityX(velocityValue);

          break;
        case 2:
          enemy.body.setVelocityX(-velocityValue);

          break;
        case 3:
          enemy.body.setVelocityY(-velocityValue);
          break;
        case 4:
          enemy.body.setVelocityY(velocityValue);
          break;
        default:
          enemy.body.setVelocityX(0);
      }
    });
    setTimeout(() => {
      this.monsters.forEach(enemy => {
        enemy.body.setVelocityX(0)
        enemy.body.setVelocityY(0)
      })
    }, 500);
  }


  rpgTalk=(arg0: (MyPlayer | Phaser.GameObjects.Container)[], monsters: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[], rpgTalk: any) =>{
     monsters.destroy();
    this.cameras.main.flash();
    store.dispatch(setRpgOpen(true))

    // throw new Error('Method not implemented.')
  }

  npcTalk(obj1,obj2){
    obj2.body.enable=false
    store.dispatch(setOpen(true))

  }

  goForest=(obj1,obj2)=>{
    obj1.body.enable=false
    obj2.body.enable=false
  


    this.scene.transition({
    target: 'forest',
    duration: 1000,
    remove: true,
})

  }

  hasMonster(obj1,obj2){
     // obj2.destroy();
      

    // this.cameras.main.flash();
  }

 checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
      console.log('checkOverlap',Phaser.Rectangle.intersects(boundsA, boundsB))
    
    return Phaser.Rectangle.intersects(boundsA, boundsB);
  }

  getMoving(){
    console.log(this.moving)
    return this.moving
  }

  setMoving(flag){
    console.log(flag,'flag')
    this.moving = flag
  }

  Plot(player, selectionItem) { // talk

    // if (this.getMoving()) {
    //   return
    // }

    // this.setMoving(true)
    store.dispatch(setOpen(true))
    // this.disableKeys()
    player?.anims?.stop()

    console.log('log', this, player, selectionItem)

  }

  

  // function to add new player to the otherPlayer group
  private handlePlayerJoined(newPlayer: IPlayer, id: string) {
    const otherPlayer = this.add.otherPlayer(newPlayer.x, newPlayer.y, 'adam', id, newPlayer.name)
    this.otherPlayers.add(otherPlayer)
    this.otherPlayerMap.set(id, otherPlayer)
  }

  // function to remove the player who left from the otherPlayer group
  private handlePlayerLeft(id: string) {
    if (this.otherPlayerMap.has(id)) {
      const otherPlayer = this.otherPlayerMap.get(id)
      if (!otherPlayer) return
      this.otherPlayers.remove(otherPlayer, true, true)
      this.otherPlayerMap.delete(id)
    }
  }

 
  // function to update target position upon receiving player updates
  private handlePlayerUpdated(field: string, value: number | string, id: string) {
    const otherPlayer = this.otherPlayerMap.get(id)
    otherPlayer?.updateOtherPlayer(field, value)
  }



  private handleChatMessageAdded(playerId: string, content: string) {
    const otherPlayer = this.otherPlayerMap.get(playerId)
    otherPlayer?.updateDialogBubble(content)
  }

  update(t: number, dt: number) {
    if (this.myPlayer && this.network) {


      this.playerSelector.update(this.myPlayer, this.cursors)
      this.myPlayer.update(this.playerSelector, this.cursors, this.network)


      this.tween.updateTo('x', this.myPlayer.x, true);
      this.tween.updateTo('y', this.myPlayer.y-50, true);


      // if(this.cursors){
      // this.physics.add.overlap([this.myPlayer, this.myPlayer.playerContainer], this.npcs,this.npcTalk);

      // }
    }
  }
}
