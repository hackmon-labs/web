// @ts-ignore
import { enableMapSet } from 'immer';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './UserStore';
import chatReducer from './ChatStore';
import talkStore from './TalkStore';

enableMapSet();

const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
    talk: talkStore,
    // ...globalStore
    // nftMarket: nftMarkReducer,
    // creatNft: creatNftReducer
  },
  // Temporary disable serialize check for redux as we store MediaStream in ComputerStore.
  // https://stackoverflow.com/a/63244831
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
