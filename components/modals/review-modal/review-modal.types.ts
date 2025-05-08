import { MainModalProps } from '@/components/modals/main-modal'
import { BridgeToEthereumFees } from '@/hooks/use-bridge-to-ethereum-fees'

export type ReviewModalProps = {
  closeModal: () => void
  feesData: BridgeToEthereumFees
} & Pick<
  MainModalProps,
  | 'handleBridgeToEthereum'
  | 'handleBridgeToTari'
  | 'isBridging'
  | 'amount'
  | 'tariWalletAddress'
  | 'ethereumAddress'
  | 'fromNetwork'
  | 'toNetwork'
>
