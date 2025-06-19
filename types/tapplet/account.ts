import { UserTransactionDTO } from '@tari-project/wxtm-bridge-backend-api'

export interface AccountData {
  account_id: number
  address: string
}

export interface WalletBalance {
  available_balance: number
  timelocked_balance: number
  pending_incoming_balance: number
  pending_outgoing_balance: number
}

export interface PendingBridgeTx {
  paymentId: string
}

export type OngoingUserTransaction = Omit<UserTransactionDTO, 'feeAmount'>

export interface BackendBridgeTransaction extends UserTransactionDTO {
  sourceAddress?: string
  mined_in_block_height?: number
}
