import { useMutation } from '@tanstack/react-query'

import {
  WrapTokenService,
  UserTransactionDTO,
} from '@tari-project/wxtm-bridge-backend-api'

import useTariAccount from '@/store/account'
import { PendingUserTransaction } from '@/types/tapplet'

export const useBridgeTransaction = () => {
  const getUserTxs = useMutation({
    mutationFn: WrapTokenService.getUserTransactions,
  })

  const {
    setOngoingTransaction,
    removePendingTransaction,

    tariAccount,
  } = useTariAccount()

  /**
   * Fetch user transactions and update the store's `in progress` transaction state.
   * Returns the updated transaction or null if none.
   */
  const getUserTransactions = async (
    currentPendingTx?: PendingUserTransaction,
  ): Promise<PendingUserTransaction | null> => {
    if (!tariAccount) return null
    const walletAddress = tariAccount.address
    const { transactions } = await getUserTxs.mutateAsync(walletAddress)

    if (Array.isArray(transactions) && transactions.length > 0) {
      // Find a pending transaction
      const ongoing = transactions.find(
        (tx) =>
          tx.status === UserTransactionDTO.status.PENDING ||
          tx.status === UserTransactionDTO.status.PROCESSING ||
          tx.status === UserTransactionDTO.status.TOKENS_RECEIVED,
      )

      if (ongoing) {
        setOngoingTransaction(ongoing)
        return ongoing
      }

      // If no pending tx found, but previously had one, check if it succeeded/failed
      const completed = transactions.find(
        (tx) =>
          (tx.status === UserTransactionDTO.status.SUCCESS ||
            tx.status === UserTransactionDTO.status.TIMEOUT) &&
          tx.paymentId === currentPendingTx?.paymentId,
      )

      if (
        currentPendingTx &&
        currentPendingTx.paymentId === completed?.paymentId
      ) {
        setOngoingTransaction(completed)
        return completed
      }
    } else {
      // No transactions found, clear any pending transaction
      if (currentPendingTx) {
        removePendingTransaction()
      }
    }

    return null
  }

  return {
    getUserTransactions,
  }
}
