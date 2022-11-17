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
import { PlayerBehavior } from '../types/PlayerBehavior'

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
  private keyE!: Phaser.Input.Keyboard.Key
  private keyR!: Phaser.Input.Keyboard.Key
  private map!: Phaser.Tilemaps.Tilemap
  myPlayer!: MyPlayer
  private items!: Phaser.Physics.Arcade.StaticGroup
  private playerSelector!: Phaser.GameObjects.Zone
  private otherPlayers!: Phaser.Physics.Arcade.Group
  private otherPlayerMap = new Map<string, OtherPlayer>()
  computerMap = new Map<string, Item>()
  moving: boolean
  monsters: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[]
  npcs: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[]

  constructor() {
    super('game')
  }

  registerKeys() {
    this.cursors ={
      ...this.input.keyboard.createCursorKeys(),
      ...this.input.keyboard.addKeys('W,S,A,D')
    } 
    // this.moveKeys = ;
    // this.cursors =  this.input.keyboard.addCapture('W,S,A,D');
    console.log(this.cursors, 'cursors', )
    // maybe we can have a dedicated method for adding keys if more keys are needed in the future
    this.keyE = this.input.keyboard.addKey('E')
    this.keyR = this.input.keyboard.addKey('R')
   
    this.input.keyboard.disableGlobalCapture()
    this.input.keyboard.on('keydown-ENTER', (event) => {
      store.dispatch(setShowChat(true))
      store.dispatch(setFocused(true))
    })
    this.input.keyboard.on('keydown-ESC', (event) => {
      store.dispatch(setShowChat(false))
    })
    store.dispatch(setFocused(false))

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
    this.scene.stop('forest')

    createCharacterAnims(this.anims)

    const map = this.make.tilemap({ key: 'tilemap' })

    let FloorAndGround = map.addTilesetImage('city', 'tiles_bg', 32, 32, 0, 0);
    // FloorAndGround = map.addTilesetImage('Modern_Exteriors_Complete_Tileset_32x32', 'idle_32x32_6', 32, 32, 0, 0);
    // const layer4 = map.createLayer('L4', FloorAndGround, 0, 0);
    // const bg = map.createLayer('bg', FloorAndGround, 0, 0);
    const Walls = map.createLayer('Walls', FloorAndGround, 0, 0);

    const groundLayer = map.createLayer('Ground', FloorAndGround, 0, 0);
    const Buildings = map.createLayer('Buildings', FloorAndGround, 0, 0);
    const land = map.createLayer('land', FloorAndGround, 0, 0);
    // groundLayer.setCollisionByProperty({
    //   collides: true
    // })

    Walls.setCollisionByProperty({
      collides: true
    })
    land.setCollisionByProperty({
      collides: true
    })
    Buildings.setCollisionByProperty({
      collides: true
    })
    
    const Top = map.createLayer('Top', FloorAndGround, 0, 0);
    Top.setDepth(1000000) 
    // this.scene.w

    this.myPlayer = this.add.myPlayer(705, 500, 'adam', this.network.mySessionId)

    this.playerSelector = new PlayerSelector(this, 0, 0, 16, 16)

    this.items = this.physics.add.staticGroup({ classType: Item })
    

    this.otherPlayers = this.physics.add.group({ classType: OtherPlayer })

    this.cameras.main.zoom = 1.3
    this.cameras.main.startFollow(this.myPlayer, true)

    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], Walls )
    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], land)
    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], Buildings)
    

    const NPCPoints = map.filterObjects(
      "NPC",
      (obj) => obj.name === "NPCPoint"
    );

    this.npcs = NPCPoints.map(npc =>
      {
      return this.physics.add.sprite(npc.x, npc.y, 'npc1', 3).setScale(1)
    });

    this.npcs.forEach(npc => {
      npc.body.setSize(npc.width * 1.5, npc.height*1.5)
      
    });

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


  
   

    // register network event listeners
    this.network.onPlayerJoined(this.handlePlayerJoined, this)
    this.network.onPlayerLeft(this.handlePlayerLeft, this)
    // this.network.onMyPlayerReady(this.handleMyPlayerReady, this)
    // this.network.onMyPlayerVideoConnected(this.handleMyVideoConnected, this)
    this.network.onPlayerUpdated(this.handlePlayerUpdated, this)
   
    this.network.onChatMessageAdded(this.handleChatMessageAdded, this)
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
    // this.cameras.main.flash();
    //  obj2.destroy();
    // this.scene.run('forest')


    this.scene.transition({
    target: 'forest',
    // data: null,
    // moveAbove: false,
    // moveBelow: false,

    duration: 1000,

    remove: true,
    // sleep: false,
    // allowInput: false,

    // onUpdate: null,
    // onUpdateScope: scene
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

      // if(this.cursors){
      // this.physics.add.overlap([this.myPlayer, this.myPlayer.playerContainer], this.npcs,this.npcTalk);

      // }
    }
  }
}
