import { BackendBridgeTransaction } from '@/types/transactions'

export type TransactionDetailsModalProps = {
  transaction: BackendBridgeTransaction
  closeModal: () => void
}