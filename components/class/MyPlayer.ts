import Phaser from 'phaser';
import PlayerSelector from './PlayerSelector';
import { PlayerBehavior } from '../types/PlayerBehavior';
import { sittingShiftData } from './Player';
import Player from './Player';
import Network from '../services/Network';
import { phaserEvents, Event } from '../events/EventCenter';
import store from '../../stores';
import { pushPlayerJoinedMessage } from '../../stores/ChatStore';

interface moveKeysType {
  W: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
}

export default class MyPlayer extends Player {
  private playContainerBody: Phaser.Physics.Arcade.Body;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, id, frame);
    this.playContainerBody = this.playerContainer
      .body as Phaser.Physics.Arcade.Body;
  }

  setPlayerName(name: string) {
    this.playerName.setText(name);
    phaserEvents.emit(Event.MY_PLAYER_NAME_CHANGE, name);
    store.dispatch(pushPlayerJoinedMessage(name));
  }

  setPlayerTexture(texture: string) {
    this.playerTexture = texture;
    // this.anims.play(`${this.playerTexture}_idle_down`, true)
    // phaserEvents.emit(Event.MY_PLAYER_TEXTURE_CHANGE, this.x, this.y, this.anims.currentAnim.key)
  }

  update(playerSelector: PlayerSelector, cursors: any, network: Network) {
    if (!cursors) return;

    switch (this.playerBehavior) {
      case PlayerBehavior.IDLE:
        const speed = 200;
        let vx = 0;
        let vy = 0;
        if (cursors.left?.isDown || cursors.A?.isDown) vx -= speed;
        if (cursors.right?.isDown || cursors.D?.isDown) vx += speed;
        if (cursors.up?.isDown || cursors.W?.isDown) {
          vy -= speed;
          this.setDepth(this.y);
        }
        if (cursors.down?.isDown || cursors.S?.isDown) {
          vy += speed;
          this.setDepth(this.y);
        }
        this.setVelocity(vx, vy);
        this.body.velocity.setLength(speed);
        this.playContainerBody.setVelocity(vx, vy);
        this.playContainerBody.velocity.setLength(speed);

        if (vx !== 0 || vy !== 0)
          network.updatePlayer(this.x, this.y, this.anims.currentAnim.key);
        if (vx > 0) {
          this.play(`${this.playerTexture}_run_right`, true);
        } else if (vx < 0) {
          this.play(`${this.playerTexture}_run_left`, true);
        } else if (vy > 0) {
          this.play(`${this.playerTexture}_run_down`, true);
        } else if (vy < 0) {
          this.play(`${this.playerTexture}_run_up`, true);
        } else {
          const parts = this.anims.currentAnim.key.split('_');
          parts[1] = 'idle';
          const newAnim = parts.join('_');
          if (this.anims.currentAnim.key !== newAnim) {
            this.play(parts.join('_'), true);
            network.updatePlayer(this.x, this.y, this.anims.currentAnim.key);
          }
        }

        // if(vx !== 0 || vy !== 0){
        //    this.scene.npcs.forEach(npc=>
        //   npc.body.enable=true
        //   )
        // }

        break;
    }
  }
}

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      myPlayer(
        x: number,
        y: number,
        texture: string,
        id: string,
        frame?: string | number
      ): MyPlayer;
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
    const sprite = new MyPlayer(this.scene, x, y, texture, id, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    this.scene.physics.world.enableBody(
      sprite,
      Phaser.Physics.Arcade.DYNAMIC_BODY
    );

    const collisionScale = [0.5, 0.2];
    sprite.body
      .setSize(
        sprite.width * collisionScale[0],
        sprite.height * collisionScale[1]
      )
      .setOffset(
        sprite.width * (1 - collisionScale[0]) * 0.5,
        sprite.height * (1 - collisionScale[1])
      );

    return sprite;
  }
);
