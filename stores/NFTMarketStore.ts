import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const nftMarket = createSlice({
  name: 'nftMarketPlace',
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
} = nftMarket.actions

export default nftMarket.reducer
