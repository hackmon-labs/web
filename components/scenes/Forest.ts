import Phaser from 'phaser'
// @ts-ignore

import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from '../anims/CharacterAnims'

import Item from '../items/Item'
import '../class/MyPlayer'
import '../class/OtherPlayer'
import MyPlayer from '../class/MyPlayer'
import PlayerSelector from '../class/PlayerSelector'
import Network from '../services/Network2'
import { IPlayer } from '../types/IOfficeState'
import OtherPlayer from '../class/OtherPlayer'
import { PlayerBehavior } from '../types/PlayerBehavior'

import store from '../../stores'
import { setConnected } from '../../stores/UserStore'
import { setFocused, setShowChat } from '../../stores/ChatStore'
import { setOpen } from '../../stores/TalkStore';

interface moveKeysType {
  W: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
}

export default class Forest extends Phaser.Scene {
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

  constructor() {
    super('forest')
  }

  registerKeys() {
    this.cursors = {
      ...this.input.keyboard.createCursorKeys(),
      ...this.input.keyboard.addKeys('W,S,A,D')
    }
    // this.moveKeys = ;
    // this.cursors =  this.input.keyboard.addCapture('W,S,A,D');
    console.log(this.cursors, 'cursors',)
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
    //  this.scene.stop('game')
    // this.scene.stop('preloader')
  }
  preload() {
    this.load.tilemapTiledJSON('tilemap2', 'assets/map/forest.json')
   
  }

  async create() {
    // initialize network instance (connect to server)
    if (!this.network) {
      throw new Error('server instance missing')
    }
    await this.network.join()
    store.dispatch(setConnected(true))

    // this.scene.stop('game')
    // this.scene.stop('preloader')

    createCharacterAnims(this.anims)

    const map = this.make.tilemap({ key: 'tilemap2' })

    let FloorAndGround = map.addTilesetImage('city', 'tiles_bg', 32, 32, 0, 0);
    // FloorAndGround = map.addTilesetImage('Modern_Exteriors_Complete_Tileset_32x32', 'idle_32x32_6', 32, 32, 0, 0);
    // const layer4 = map.createLayer('L4', FloorAndGround, 0, 0);
    // const bg = map.createLayer('bg', FloorAndGround, 0, 0);
    const Walls = map.createLayer('Walls', FloorAndGround, 0, 0);

    const groundLayer = map.createLayer('floor', FloorAndGround, 0, 0);
    const Buildings = map.createLayer('mid', FloorAndGround, 0, 0);
    // groundLayer.setCollisionByProperty({
    //   collides: true
    // })

    Walls.setCollisionByProperty({
      collides: true
    })
    Buildings.setCollisionByProperty({
      collides: true
    })
    const Top = map.createLayer('Top', FloorAndGround, 0, 0);
    Top.setDepth(1000000)
    // this.scene.w
    console.log(this.myPlayer,'myPlayer1111')

    this.myPlayer = this.add.myPlayer(705, 500, 'adam', this.network.mySessionId)

    this.playerSelector = new PlayerSelector(this, 0, 0, 16, 16)

    this.items = this.physics.add.staticGroup({ classType: Item })


    this.otherPlayers = this.physics.add.group({ classType: OtherPlayer })

    this.cameras.main.zoom = 1.3
    this.cameras.main.startFollow(this.myPlayer, true)

    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], Walls)
    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], Buildings)
    // this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], layer3, this.Plot, null, this)


    // this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], fish, this.hitBomb, null, this);  // 设置player 和 bombs 碰撞. 

    // this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], bar, this.hitBar, null, this);  // 设置player 和 bombs 碰撞. 

    // this.physics.add.overlap(
    //   // this.myPlayer,
    //   // this.myPlayer.parentContainer,
    //   [this.myPlayer, this.myPlayer.playerContainer], layer3, this.Plot, null, this
    // )

    const NPCPoints = map.filterObjects(
      "mons",
      (obj) => obj.name === "mon"
    );



    this.npcs = NPCPoints.map(npc => {
      return this.physics.add.sprite(npc.x, npc.y, 'npc1', 3).setScale(1)
    });



    this.npcs.forEach(npc => {
      npc.body.setSize(npc.width * 1.5, npc.height * 1.5)

    });

    this.physics.add.overlap([this.myPlayer, this.myPlayer.playerContainer], this.npcs, this.npcTalk);





    // register network event listeners
    this.network.onPlayerJoined(this.handlePlayerJoined, this)
    this.network.onPlayerLeft(this.handlePlayerLeft, this)
    // this.network.onMyPlayerReady(this.handleMyPlayerReady, this)
    // this.network.onMyPlayerVideoConnected(this.handleMyVideoConnected, this)
    this.network.onPlayerUpdated(this.handlePlayerUpdated, this)

    this.network.onChatMessageAdded(this.handleChatMessageAdded, this)
  }

  npcTalk(obj1, obj2) {
    obj2.body.enable = false
    store.dispatch(setOpen(true))

  }

  hasMonster(obj1, obj2) {
    // obj2.destroy();


    // this.cameras.main.flash();
  }

  checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    console.log('checkOverlap', Phaser.Rectangle.intersects(boundsA, boundsB))

    return Phaser.Rectangle.intersects(boundsA, boundsB);
  }

  getMoving() {
    console.log(this.moving)
    return this.moving
  }

  setMoving(flag) {
    console.log(flag, 'flag')
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
