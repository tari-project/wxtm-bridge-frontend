import { MainModalProps } from '@/components/modals/main-modal'
import { CombinedBridgeTransaction } from '@/types/transactions'

export type SuccessModalProps = {
  closeModalAction: () => void
  detailedTx?: CombinedBridgeTransaction
  type: 'wrap' | 'unwrap'
} & Pick<MainModalProps, 'amount' | 'tariWalletAddress' | 'ethereumAddress'>
