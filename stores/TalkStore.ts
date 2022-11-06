import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const talkStore = createSlice({
  name: 'talk',
  initialState: {
    open: false,
  },
  reducers: {
    setOpen: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload
    },
  }
})

export const {
  setOpen,
} = talkStore.actions

export default talkStore.reducer
