import Phaser from 'phaser'
import PlayerSelector from './PlayerSelector'
import { PlayerBehavior } from '../types/PlayerBehavior'
import { sittingShiftData } from './Player'
import Player from './Player'
import Network from '../services/Network'
import Item from '../items/Item'
import { phaserEvents, Event } from '../events/EventCenter'
import store from '../../stores'
import { pushPlayerJoinedMessage } from '../../stores/ChatStore'

interface moveKeysType{
  W: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
}

export default class MyPlayer extends Player {
  private playContainerBody: Phaser.Physics.Arcade.Body
  private itemOnSit?: Item
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, id, frame)
    this.playContainerBody = this.playerContainer.body as Phaser.Physics.Arcade.Body
  }

  setPlayerName(name: string) {
    this.playerName.setText(name)
    phaserEvents.emit(Event.MY_PLAYER_NAME_CHANGE, name)
    store.dispatch(pushPlayerJoinedMessage(name))
  }

  setPlayerTexture(texture: string) {
    this.playerTexture = texture
    // this.anims.play(`${this.playerTexture}_idle_down`, true)
    // phaserEvents.emit(Event.MY_PLAYER_TEXTURE_CHANGE, this.x, this.y, this.anims.currentAnim.key)
  }

  update(
    playerSelector: PlayerSelector,
    cursors:any,
    keyE: Phaser.Input.Keyboard.Key,
    keyR: Phaser.Input.Keyboard.Key,
    network: Network
  ) {
    if (!cursors) return

    const item = playerSelector.selectedItem


    switch (this.playerBehavior) {
      case PlayerBehavior.IDLE:
        // if press E in front of selected chair
        if (Phaser.Input.Keyboard.JustDown(keyE) && item?.texture.key === 'chairs') {
          /**
           * move player to the chair and play sit animation
           * a delay is called to wait for player movement (from previous velocity) to end
           * as the player tends to move one more frame before sitting down causing player
           * not sitting at the center of the chair
           */
          this.scene.time.addEvent({
            delay: 10,
            callback: () => {
              // update character velocity and position
              this.setVelocity(0, 0)
              if (item.itemDirection) {
                this.setPosition(
                  item.x + sittingShiftData[item.itemDirection][0],
                  item.y + sittingShiftData[item.itemDirection][1]
                ).setDepth(item.depth + sittingShiftData[item.itemDirection][2])
                // also update playerNameContainer velocity and position
                this.playContainerBody.setVelocity(0, 0)
                this.playerContainer.setPosition(
                  item.x + sittingShiftData[item.itemDirection][0],
                  item.y + sittingShiftData[item.itemDirection][1] - 30
                )
              }

              this.play(`${this.playerTexture}_sit_${item.itemDirection}`, true)
              playerSelector.selectedItem = undefined
              playerSelector.setPosition(this.x, this.y - this.height)
              // playerSelector.setPosition(0, 0)
              // send new location and anim to server
              network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
            },
            loop: false,
          })
          // set up new dialog as player sits down
          item.clearDialogBox()
          item.setDialogBox('Press E to leave')
          this.itemOnSit = item
          this.playerBehavior = PlayerBehavior.SITTING
          return
        }

        const speed = 200
        let vx = 0
        let vy = 0
        if (cursors.left?.isDown || cursors.A?.isDown) vx -= speed
        if (cursors.right?.isDown || cursors.D?.isDown) vx += speed
        if (cursors.up?.isDown || cursors.W?.isDown) {
          vy -= speed
          this.setDepth(this.y) //change player.depth if player.y changes
        }
        if (cursors.down?.isDown || cursors.S?.isDown) {
          vy += speed
          this.setDepth(this.y) //change player.depth if player.y changes
        }
        // update character velocity
        this.setVelocity(vx, vy)
        this.body.velocity.setLength(speed)
        // also update playerNameContainer velocity
        this.playContainerBody.setVelocity(vx, vy)
        this.playContainerBody.velocity.setLength(speed)

        // update animation according to velocity and send new location and anim to server
        if (vx !== 0 || vy !== 0) network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
        if (vx > 0) {
          this.play(`${this.playerTexture}_run_right`, true)
        } else if (vx < 0) {
          this.play(`${this.playerTexture}_run_left`, true)
        } else if (vy > 0) {
          this.play(`${this.playerTexture}_run_down`, true)
        } else if (vy < 0) {
          this.play(`${this.playerTexture}_run_up`, true)
        } else {
          const parts = this.anims.currentAnim.key.split('_')
          parts[1] = 'idle'
          const newAnim = parts.join('_')
          // this prevents idle animation keeps getting called
          if (this.anims.currentAnim.key !== newAnim) {
            this.play(parts.join('_'), true)
            // send new location and anim to server
            network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
          }
        }
        break

      case PlayerBehavior.SITTING:
        // back to idle if player press E while sitting
        if (Phaser.Input.Keyboard.JustDown(keyE)) {
          const parts = this.anims.currentAnim.key.split('_')
          parts[1] = 'idle'
          this.play(parts.join('_'), true)
          this.playerBehavior = PlayerBehavior.IDLE
          this.itemOnSit?.clearDialogBox()
          playerSelector.setPosition(this.x, this.y)
          playerSelector.update(this, cursors)
          network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
        }
        break
    }
  }
}

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      myPlayer(x: number, y: number, texture: string, id: string, frame?: string | number): MyPlayer
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'myPlayer',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    const sprite = new MyPlayer(this.scene, x, y, texture, id, frame)

    this.displayList.add(sprite)
    this.updateList.add(sprite)

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

    const collisionScale = [0.5, 0.2]
    sprite.body
      .setSize(sprite.width * collisionScale[0], sprite.height * collisionScale[1])
      .setOffset(
        sprite.width * (1 - collisionScale[0]) * 0.5,
        sprite.height * (1 - collisionScale[1])
      )

    return sprite
  }
)
