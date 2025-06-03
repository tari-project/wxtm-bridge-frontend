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

  const setOngoingTransaction = useTariAccount.getState().setOngoingTransaction
  const removeOngoingTransaction =
    useTariAccount.getState().removeOngoingTransaction

  /**
   * Fetch user transactions and update the store's ongoing transaction state.
   * Returns the updated ongoing transaction or null if none.
   */
  const getUserTransactions =
    async (): Promise<PendingUserTransaction | null> => {
      const ongoingBridgeTx = useTariAccount.getState().ongoingBridgeTx
      const tariAccount = useTariAccount.getState().tariAccount

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
        const ongoingCompleted = transactions.find(
          (tx) =>
            (tx.status === UserTransactionDTO.status.SUCCESS ||
              tx.status === UserTransactionDTO.status.TIMEOUT) &&
            tx.paymentId === ongoingBridgeTx?.paymentId,
        )

        if (ongoingCompleted) {
          setOngoingTransaction(ongoingCompleted)
          return ongoingCompleted
        }
      } else {
        // No transactions found, clear any pending transaction
        removeOngoingTransaction()
      }

      return null
    }

  return {
    getUserTransactions,
  }
}
