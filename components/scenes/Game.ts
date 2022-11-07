import Phaser from 'phaser'

import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from '../anims/CharacterAnims'

import Item from '../items/Item'
import '../characters/MyPlayer'
import '../characters/OtherPlayer'
import MyPlayer from '../characters/MyPlayer'
import PlayerSelector from '../characters/PlayerSelector'
import Network from '../services/Network'
import { IPlayer } from '../types/IOfficeState'
import OtherPlayer from '../characters/OtherPlayer'
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

    createCharacterAnims(this.anims)

    const map = this.make.tilemap({ key: 'tilemap' })

    const FloorAndGround = map.addTilesetImage('Modern_Exteriors_Complete_Tileset_32x32', 'tiles_bg', 32, 32, 0, 0);
    // const layer4 = map.createLayer('L4', FloorAndGround, 0, 0);
    // const bg = map.createLayer('bg', FloorAndGround, 0, 0);

    const groundLayer = map.createLayer('Tile Layer 1', FloorAndGround, 0, 0);
    const layer2 = map.createLayer('Tile Layer 2', FloorAndGround, 0, 0);
    const layer3 = map.createLayer('Tile Layer 3', FloorAndGround, 0, 0);
   
    groundLayer.setCollisionByProperty({
      collides: true
    })

    layer2.setCollisionByProperty({
      collides: true
    })
    layer3.setCollisionByProperty({
      collides: true
    })
  
   
    // debugDraw(bg, this)

    this.myPlayer = this.add.myPlayer(705, 500, 'adam', this.network.mySessionId)
    // this.myPlayer = this.add.myPlayer(705, 500, 'chair', this.network.mySessionId)

    console.log(this.myPlayer,'this.myplayer')
    this.playerSelector = new PlayerSelector(this, 0, 0, 16, 16)

    this.items = this.physics.add.staticGroup({ classType: Item })
    

    this.otherPlayers = this.physics.add.group({ classType: OtherPlayer })

    this.cameras.main.zoom = 1.5
    this.cameras.main.startFollow(this.myPlayer, true)

    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], groundLayer)
    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], layer2)
    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], layer3, this.Plot, null, this)


    // this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], fish, this.hitBomb, null, this);  // 设置player 和 bombs 碰撞. 
   
    // this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], bar, this.hitBar, null, this);  // 设置player 和 bombs 碰撞. 


    this.physics.add.overlap(
      this.playerSelector,
      this.items,
      this.handleItemSelectorOverlap,
      undefined,
      this
    )

   

    // register network event listeners
    this.network.onPlayerJoined(this.handlePlayerJoined, this)
    this.network.onPlayerLeft(this.handlePlayerLeft, this)
    // this.network.onMyPlayerReady(this.handleMyPlayerReady, this)
    // this.network.onMyPlayerVideoConnected(this.handleMyVideoConnected, this)
    this.network.onPlayerUpdated(this.handlePlayerUpdated, this)
   
    this.network.onChatMessageAdded(this.handleChatMessageAdded, this)
  }

  getMoving(){
    console.log(this.moving)
    return this.moving
  }

  setMoving(flag){
    console.log(flag,'flag')
    this.moving = flag
  }

  Plot(player: { anims: { stop: () => void } }, selectionItem: any) { // fishing

    // if (this.getMoving()) {
    //   return
    // }

    // this.setMoving(true)
    store.dispatch(setOpen(true))
    // this.disableKeys()
    player?.anims?.stop()

    console.log('log', this, player, selectionItem)

  }

 

 

  private handleItemSelectorOverlap(playerSelector, selectionItem) {
    const currentItem = playerSelector.selectedItem
    // currentItem is undefined if nothing was perviously selected
    if (currentItem) {
      // if the selection has not changed, do nothing
      if (currentItem === selectionItem || currentItem.depth >= selectionItem.depth) {
        return
      }
      // if selection changes, clear pervious dialog
      if (this.myPlayer.playerBehavior !== PlayerBehavior.SITTING) currentItem.clearDialogBox()
    }

    // set selected item and set up new dialog
    playerSelector.selectedItem = selectionItem
    selectionItem.onOverlapDialog()
  }

  private addObjectFromTiled(
    group: Phaser.Physics.Arcade.StaticGroup,
    object: Phaser.Types.Tilemaps.TiledObject,
    key: string,
    tilesetName: string
  ) {
    const actualX = object.x! + object.width! * 0.5
    const actualY = object.y! - object.height! * 0.5
    const obj = group
      .get(actualX, actualY, key, object.gid! - this.map.getTileset(tilesetName).firstgid)
      .setDepth(actualY)
    return obj
  }

  private addGroupFromTiled(
    objectLayerName: string,
    key: string,
    tilesetName: string,
    collidable: boolean
  ) {
    const group = this.physics.add.staticGroup()
    const objectLayer = this.map.getObjectLayer(objectLayerName)
    objectLayer.objects.forEach((object) => {
      const actualX = object.x! + object.width! * 0.5
      const actualY = object.y! - object.height! * 0.5
      group
        .get(actualX, actualY, key, object.gid! - this.map.getTileset(tilesetName).firstgid)
        .setDepth(actualY)
    })
    if (this.myPlayer && collidable)
      this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], group)
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
      this.myPlayer.update(this.playerSelector, this.cursors, this.keyE, this.keyR, this.network)
    }
  }
}
