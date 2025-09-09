import { MainModalProps } from '@/components/modals/main-modal'
import { CombinedBridgeTransaction } from '@/types/transactions'

export type SuccessModalProps = {
  closeModal: () => void
  detailedTx?: CombinedBridgeTransaction
} & Pick<
  MainModalProps,
  'amount' | 'tariWalletAddress' | 'ethereumAddress' | 'fromNetwork'
>
