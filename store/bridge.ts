import { create } from 'zustand'

interface State {
  wrapTokenFeePercentageBps: number
  unwrapTokenFeePercentageBps: number
  tariColdWalletAddress: string
}

interface Actions {
  setWrapTokenFeePercentageBps: (fee: number) => void
  setUnwrapTokenFeePercentageBps: (fee: number) => void
  setTariColdWalletAddress: (address: string) => void
}

type BridgeConfigStoreState = State & Actions

const initialState: State = {
  wrapTokenFeePercentageBps: 50, // 0.5% fee
  unwrapTokenFeePercentageBps: 50, // 0.5% fee
  tariColdWalletAddress: '',
}

export const useBridgeStore = create<BridgeConfigStoreState>()((set) => ({
  ...initialState,
  setWrapTokenFeePercentageBps: (fee: number) => {
    set({
      wrapTokenFeePercentageBps: fee,
    })
  },
  setUnwrapTokenFeePercentageBps: (fee: number) => {
    set({
      unwrapTokenFeePercentageBps: fee,
    })
  },
  setTariColdWalletAddress: (address: string) => {
    set({
      tariColdWalletAddress: address,
    })
  },
}))

export default useBridgeStore
