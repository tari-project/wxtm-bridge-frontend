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

  const { setPendingTransaction, removePendingTransaction } = useTariAccount()

  /**
   * Fetch user transactions and update the store's pending transaction state.
   * Returns the updated pending transaction or null if none.
   */
  const getUserTransactions = async (
    walletAddress: string,
    currentPendingTx?: PendingUserTransaction,
  ): Promise<PendingUserTransaction | null> => {
    const { transactions } = await getUserTxs.mutateAsync(walletAddress)

    console.warn(
      '!!!!! [ TAPPLET-BRIDGE ][getTxs backend] all transactions:',
      transactions,
    )

    if (Array.isArray(transactions) && transactions.length > 0) {
      // Find a pending transaction
      const pending = transactions.find(
        (tx) => tx.status === UserTransactionDTO.status.PENDING,
      )

      if (pending) {
        setPendingTransaction(pending)
        return pending
      }

      // If no pending tx found, but previously had one, check if it succeeded and remove it
      const success = transactions.find(
        (tx) => tx.status === UserTransactionDTO.status.SUCCESS,
      )

      if (
        currentPendingTx &&
        currentPendingTx.paymentId === success?.paymentId
      ) {
        console.warn(
          '!!!!! [ TAPPLET-BRIDGE ][getTxs backend] SUCCESS:',
          success,
        )
        removePendingTransaction()
        return success
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
