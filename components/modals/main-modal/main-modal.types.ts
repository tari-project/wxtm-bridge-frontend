import { BridgeTxDetails } from '@/clients/tari-l1-signer'
import { Network } from '@/components/network-box'
import { BridgeToEthereumFees } from '@/hooks/use-bridge-to-ethereum-fees'

export type MainModalProps = {
  setModalOpen: (open: boolean) => void
  success: boolean
  step: number
  setStep: (step: number) => void
  handleBridgeToEthereum: () => void
  handleBridgeToTari: () => void
  isBridging: boolean
  amount: string
  ethereumAddress?: string
  tariWalletAddress?: string
  fromNetwork: Network
  toNetwork: Network
  feesData: BridgeToEthereumFees
  pendingBridgeTxFromTU?: BridgeTxDetails
}
