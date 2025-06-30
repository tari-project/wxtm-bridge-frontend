import { MainModalProps } from '@/components/modals/main-modal'
import { BridgeToEthereumFees } from '@/hooks/use-bridge-to-ethereum-fees'
import { BackendBridgeTransaction } from '@/types/transactions'

export type WrapModalProps = {
  closeModal: () => void
  feesData: BridgeToEthereumFees
  amountAfterFee?: string
  destinationAddress?: string
  transactionStatus?: BackendBridgeTransaction
} & Pick<
  MainModalProps,
  'tariWalletAddress' | 'ethereumAddress' | 'fromNetwork'
>
