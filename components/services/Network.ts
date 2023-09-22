import { Client, Room } from 'colyseus.js';
import { IOfficeState, IPlayer } from '../types/IOfficeState';
import { Message } from '../types/Messages';
import { phaserEvents, Event } from '../events/EventCenter';
import store from '../../stores';
import {
  setSessionId,
  setPlayerNameMap,
  removePlayerNameMap,
} from '../../stores/UserStore';
import {
  pushChatMessage,
  pushPlayerJoinedMessage,
  pushPlayerLeftMessage,
} from '../../stores/ChatStore';

export default class Network {
  private client: Client;
  private room?: Room<IOfficeState>;

  mySessionId!: string;

  constructor() {
    const protocol = window.location.protocol.replace('http', 'ws');
    // const endpoint = process.env.NODE_ENV === 'production' ? `wss://vuy0gy.us-east-vin.colyseus.net` : `ws://vuy0gy.us-east-vin.colyseus.net`
    // const endpoint = process.env.NODE_ENV === 'production' ? `wss://ap-jov.colyseus.dev` : `ws://localhost:2567`
    // const endpoint = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_SERVER_URL : `ws://localhost:2567`
    const endpoint = process.env.NEXT_PUBLIC_ENDPOINT;
    this.client = new Client(endpoint);

    phaserEvents.on(Event.MY_PLAYER_NAME_CHANGE, this.updatePlayerName, this);
    phaserEvents.on(Event.MY_PLAYER_TEXTURE_CHANGE, this.updatePlayer, this);
  }

  // @ts-ignore

  async join() {
    this.room = await this.client.joinOrCreate('Hackmon');
    this.mySessionId = this.room.sessionId;
    store.dispatch(setSessionId(this.room.sessionId));

    // new instance added to the players MapSchema
    this.room.state.players.onAdd = (player: IPlayer, key: string) => {
      if (key === this.mySessionId) return;

      // track changes on every child object inside the players MapSchema
      // @ts-ignore

      player.onChange = (changes) => {
        changes.forEach((change) => {
          const { field, value } = change;
          phaserEvents.emit(Event.PLAYER_UPDATED, field, value, key);

          // when a new player finished setting up player name
          if (field === 'name' && value !== '') {
            phaserEvents.emit(Event.PLAYER_JOINED, player, key);
            store.dispatch(setPlayerNameMap({ id: key, name: value }));
            store.dispatch(pushPlayerJoinedMessage(value));
          }
        });
      };
    };

    // an instance removed from the players MapSchema
    this.room.state.players.onRemove = (player: IPlayer, key: string) => {
      phaserEvents.emit(Event.PLAYER_LEFT, key);
      store.dispatch(pushPlayerLeftMessage(player.name));
      store.dispatch(removePlayerNameMap(key));
    };

    // new instance added to the chatMessages ArraySchema
    this.room.state.chatMessages.onAdd = (item, index) => {
      store.dispatch(pushChatMessage(item));
    };

    // when a user sends a message
    this.room.onMessage(Message.ADD_CHAT_MESSAGE, ({ clientId, content }) => {
      phaserEvents.emit(Event.UPDATE_DIALOG_BUBBLE, clientId, content);
    });
  }

  // method to register event listener and call back function when a item user added
  onChatMessageAdded(
    callback: (playerId: string, content: string) => void,
    context?: any
  ) {
    phaserEvents.on(Event.UPDATE_DIALOG_BUBBLE, callback, context);
  }

  // method to register event listener and call back function when a player joined
  onPlayerJoined(
    callback: (Player: IPlayer, key: string) => void,
    context?: any
  ) {
    phaserEvents.on(Event.PLAYER_JOINED, callback, context);
  }

  // method to register event listener and call back function when a player left
  onPlayerLeft(callback: (key: string) => void, context?: any) {
    phaserEvents.on(Event.PLAYER_LEFT, callback, context);
  }

  // method to register event listener and call back function when myPlayer is ready to connect
  onMyPlayerReady(callback: (key: string) => void, context?: any) {
    phaserEvents.on(Event.MY_PLAYER_READY, callback, context);
  }

  // method to register event listener and call back function when a player updated
  onPlayerUpdated(
    callback: (field: string, value: number | string, key: string) => void,
    context?: any
  ) {
    phaserEvents.on(Event.PLAYER_UPDATED, callback, context);
  }

  // method to send player updates to Colyseus server
  updatePlayer(currentX: number, currentY: number, currentAnim: string) {
    this.room?.send(Message.UPDATE_PLAYER, {
      x: currentX,
      y: currentY,
      anim: currentAnim,
    });
  }

  // method to send player name to Colyseus server
  updatePlayerName(currentName: string) {
    this.room?.send(Message.UPDATE_PLAYER_NAME, { name: currentName });
  }

  addChatMessage(content: string) {
    this.room?.send(Message.ADD_CHAT_MESSAGE, { content: content });
  }
}
