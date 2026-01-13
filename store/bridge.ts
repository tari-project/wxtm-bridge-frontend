import { create } from 'zustand'
import { Network } from '@/components/network-box'

export type NetworkOption = 'Tari' | 'Ethereum'
export type NetworkOptions = Record<NetworkOption, Network>

export const NETWORKS: NetworkOptions = {
  Tari: { name: 'Tari', icon: '/icons/tari.png' },
  Ethereum: { name: 'Ethereum', icon: '/icons/eth.png' },
}

interface BridgeConfigStoreState {
  fromNetwork: Network
  toNetwork: Network
  wrapTokenFeePercentageBps: number
  unwrapTokenFeePercentageBps: number
  tariColdWalletAddress: string
}
const initialState: BridgeConfigStoreState = {
  wrapTokenFeePercentageBps: 50, // 0.5% fee
  unwrapTokenFeePercentageBps: 50, // 0.5% fee
  tariColdWalletAddress: '',
  fromNetwork: NETWORKS.Tari,
  toNetwork: NETWORKS.Ethereum,
}

export const useBridgeStore = create<BridgeConfigStoreState>()(() => ({
  ...initialState,
}))

export const setWrapTokenFeePercentageBps = (fee: number) =>
  useBridgeStore.setState({
    wrapTokenFeePercentageBps: fee,
  })

export const setUnwrapTokenFeePercentageBps = (fee: number) =>
  useBridgeStore.setState({
    unwrapTokenFeePercentageBps: fee,
  })

export const setTariColdWalletAddress = (address: string) =>
  useBridgeStore.setState({
    tariColdWalletAddress: address,
  })

export const setFromNetwork = (fromNetworkOption: string) => {
  const fromNetwork = NETWORKS[fromNetworkOption as NetworkOption]
  if (fromNetwork) {
    useBridgeStore.setState({ fromNetwork })
  }
}

export const setToNetwork = (toNetworkOption: string) => {
  const toNetwork = NETWORKS[toNetworkOption as NetworkOption]
  if (toNetwork) {
    useBridgeStore.setState({ toNetwork })
  }
}

export default useBridgeStore
