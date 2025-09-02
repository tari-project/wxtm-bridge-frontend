import { MainModalProps } from '@/components/modals/main-modal'
import { BridgeFees } from '@/hooks/use-bridge-fees'
import { BackendBridgeTransaction } from '@/types/transactions'

export type WrapModalProps = {
  closeModal: () => void
  feesData: BridgeFees
  amountAfterFee?: string
  destinationAddress?: string
  transactionStatus?: BackendBridgeTransaction
} & Pick<
  MainModalProps,
  'tariWalletAddress' | 'ethereumAddress' | 'fromNetwork'
>
