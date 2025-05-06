import { Network } from '../network-box/network-box.types'

export type ReviewModalProps = {
  closeModal: () => void
  handleBridgeToEthereum: () => void
  handleBridgeToTari: () => void
  isBridging: boolean
  amount: string
  tariWalletAddress?: string
  ethereumAddress?: string
  fromNetwork: Network
  toNetwork: Network
}
