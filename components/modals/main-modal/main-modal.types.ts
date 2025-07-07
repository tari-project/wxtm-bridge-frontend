import { Network } from '@/components/network-box'
import { BridgeToEthereumFees } from '@/hooks/use-bridge-to-ethereum-fees'

export type MainModalProps = {
  success: boolean
  failed: boolean
  step: number
  handleBridgeToEthereum: () => void
  handleBridgeToTari: () => void
  isBridging: boolean
  amount: string
  ethereumAddress?: string
  tariWalletAddress?: string
  fromNetwork: Network
  toNetwork: Network
  feesData: BridgeToEthereumFees
  closeModal: () => void
}
