import { MainModalProps } from '@/components/modals/main-modal'
import { BackendBridgeTransaction } from '@/types/transactions'

export type SuccessModalProps = {
  closeModal: () => void
  detailedTx?: BackendBridgeTransaction
} & Pick<
  MainModalProps,
  'amount' | 'tariWalletAddress' | 'ethereumAddress' | 'fromNetwork'
>
