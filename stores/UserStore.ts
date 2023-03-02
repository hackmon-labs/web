import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const sanitizeId = (id: string) => {
  let sanitized = id;

  if (sanitized.length > 9 && sanitized.endsWith('-ss')) {
    sanitized = sanitized.substring(0, sanitized.length - 3);
  }

  return sanitized.replace(/[^0-9a-z]/gi, 'G');
};

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    sessionId: '',
    connected: false,
    loggedIn: false,
    playerNameMap: new Map<string, string>(),
    tipsOpen: false,
    rpgOpen: false,
    info: {
      token: '',
    },
    packageOpen: false,
    aigcOpen: false,
  },
  reducers: {
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.loggedIn = action.payload;
    },
    setPlayerNameMap: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      state.playerNameMap.set(
        sanitizeId(action.payload.id),
        action.payload.name
      );
    },
    removePlayerNameMap: (state, action: PayloadAction<string>) => {
      state.playerNameMap.delete(sanitizeId(action.payload));
    },
    setTipsOpen: (state, action: PayloadAction<boolean>) => {
      state.tipsOpen = action.payload;
    },
    setRpgOpen: (state, action: PayloadAction<boolean>) => {
      state.rpgOpen = action.payload;
    },
    setInfo: (state, action: PayloadAction<boolean>) => {
      state.info = action.payload;
    },
    setPackageOpen: (state, action: PayloadAction<boolean>) => {
      state.packageOpen = action.payload;
    },
    setAigcOpen: (state, action: PayloadAction<boolean>) => {
      state.aigcOpen = action.payload;
    },
  },
});

export const {
  setSessionId,
  setConnected,
  setLoggedIn,
  setPlayerNameMap,
  removePlayerNameMap,
  setTipsOpen,
  setRpgOpen,
  setInfo,
  setPackageOpen,
  setAigcOpen,
} = userSlice.actions;

export default userSlice.reducer;
