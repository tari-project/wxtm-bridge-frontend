import { create } from 'zustand'

interface State {
  wrapTokenFeePercentageBps: number
  tariColdWalletAddress: string
}

interface Actions {
  setWrapTokenFeePercentageBps: (fee: number) => void
  setTariColdWalletAddress: (address: string) => void
}

type BridgeConfigStoreState = State & Actions

const initialState: State = {
  wrapTokenFeePercentageBps: 50, // 0.5% fee
  tariColdWalletAddress: '',
}

export const useBridgeStore = create<BridgeConfigStoreState>()((set) => ({
  ...initialState,
  setWrapTokenFeePercentageBps: (fee: number) => {
    set({
      wrapTokenFeePercentageBps: fee,
    })
  },
  setTariColdWalletAddress: (address: string) => {
    set({
      tariColdWalletAddress: address,
    })
  },
}))

export default useBridgeStore
