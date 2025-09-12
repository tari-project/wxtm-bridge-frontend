import { CombinedBridgeTransaction } from '@/types/transactions'

export type TransactionDetailsModalProps = {
  transaction: CombinedBridgeTransaction
  closeModal: () => void
}
