import { BridgeTxDetails } from '@/clients/tari-l1-signer'
import { MainModalProps } from '@/components/modals/main-modal'
import { BridgeToEthereumFees } from '@/hooks/use-bridge-to-ethereum-fees'

export type WrapModalProps = {
  closeModal: () => void
  feesData: BridgeToEthereumFees
  pendingBridgeTxFromTU?: BridgeTxDetails
} & Pick<
  MainModalProps,
  'amount' | 'tariWalletAddress' | 'ethereumAddress' | 'fromNetwork'
>
