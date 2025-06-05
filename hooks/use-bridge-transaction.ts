import { useMutation } from '@tanstack/react-query'

import {
  WrapTokenService,
  UserTransactionDTO,
} from '@tari-project/wxtm-bridge-backend-api'

import useTariAccountStore from '@/store/account'
import { PendingUserTransaction } from '@/types/tapplet'

export const useBridgeTransaction = () => {
  const getUserTxs = useMutation({
    mutationFn: WrapTokenService.getUserTransactions,
  })

  const setOngoingTransaction =
    useTariAccountStore.getState().setOngoingTransaction
  const removeOngoingTransaction =
    useTariAccountStore.getState().removeOngoingTransaction

  /**
   * Fetch user transactions and update the store's ongoing transaction state.
   * Returns the updated ongoing transaction or null if none.
   */
  const getUserTransactions =
    async (): Promise<PendingUserTransaction | null> => {
      const ongoingBridgeTx = useTariAccountStore.getState().ongoingBridgeTx
      const lastOngoingPaymentIdFromTU =
        useTariAccountStore.getState().lastOngoingPaymentIdFromTU
      const tariAccount = useTariAccountStore.getState().tariAccount

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
        // check also with the paymentId from the TU to display modal after the bridge relaunch
        const validPaymentIds = new Set([
          ongoingBridgeTx?.paymentId,
          lastOngoingPaymentIdFromTU,
        ])
        const validStatuses = new Set([
          UserTransactionDTO.status.SUCCESS,
          UserTransactionDTO.status.TIMEOUT,
        ])

        const ongoingCompleted = transactions.find(
          ({ paymentId, status }) =>
            validPaymentIds.has(paymentId) && validStatuses.has(status),
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
