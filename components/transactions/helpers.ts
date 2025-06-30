import useAppStore from '@/store/app'
import { BackendBridgeTransaction, TransactionInfo } from '@/types/transactions'
import { UserTransactionDTO } from '@tari-project/wxtm-bridge-backend-api'

function formatTimeStamp(timestamp: number): string {
  const appLanguage = useAppStore.getState().language
  return new Date(timestamp * 1000)?.toLocaleString(appLanguage, {
    month: 'short',
    day: '2-digit',
    hourCycle: 'h23',
    hour: 'numeric',
    minute: 'numeric',
  })
}

function formatBridgeDateToTimestamp(date: string): number {
  //2025-05-28T08:53:02.859Z
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date format')
  }
  return Math.floor(dateObj.getTime() / 1000) // Convert to seconds
}

function getTimestampFromTransaction(
  transaction: TransactionInfo | BackendBridgeTransaction,
): number {
  if (isTransactionInfo(transaction)) {
    return transaction.timestamp
  } else if (isBridgeTransaction(transaction)) {
    return formatBridgeDateToTimestamp(transaction.createdAt)
  }
  throw new Error('Invalid transaction type')
}

function findFirstNonBridgeTransaction(
  transactions: (TransactionInfo | BackendBridgeTransaction)[],
): TransactionInfo | undefined {
  return transactions.find(
    (tx) => 'direction' in tx && tx.direction !== undefined,
  ) as TransactionInfo | undefined
}

function findByTransactionId(
  transactions: (TransactionInfo | BackendBridgeTransaction)[],
  txId: number | undefined,
): TransactionInfo | undefined {
  return transactions.find((tx) => 'tx_id' in tx && tx.tx_id === txId) as
    | TransactionInfo
    | undefined
}

function isBridgeTransaction(
  transaction: TransactionInfo | BackendBridgeTransaction,
): transaction is BackendBridgeTransaction {
  return (
    'tokenAmount' in transaction && typeof transaction.tokenAmount === 'string'
  )
}

function isTransactionInfo(
  transaction: TransactionInfo | BackendBridgeTransaction,
): transaction is TransactionInfo {
  return 'tx_id' in transaction && typeof transaction.tx_id === 'string'
}

const getStatusInfo = (status: UserTransactionDTO.status | undefined) => {
  if (
    status === UserTransactionDTO.status.PENDING ||
    status === UserTransactionDTO.status.PROCESSING ||
    status === UserTransactionDTO.status.TOKENS_RECEIVED
  ) {
    return {
      statusType: 'pending' as const,
      text: 'Pending',
      showIcon: true,
    }
  }
  if (status === UserTransactionDTO.status.SUCCESS) {
    return {
      statusType: 'completed' as const,
      text: 'Completed',
      showIcon: false,
    }
  }
  if (status === UserTransactionDTO.status.TIMEOUT) {
    return { statusType: 'timeout' as const, text: 'Timeout', showIcon: false }
  }
  return { statusType: 'default' as const, text: status, showIcon: false }
}

export {
  formatTimeStamp,
  findFirstNonBridgeTransaction,
  findByTransactionId,
  isBridgeTransaction,
  isTransactionInfo,
  getTimestampFromTransaction,
  getStatusInfo,
}
