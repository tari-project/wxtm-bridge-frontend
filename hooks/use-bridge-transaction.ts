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

  const { setOngoingTransaction, removeOngoingTransaction } = useTariAccount()

  /**
   * Fetch user transactions and update the store's `in progress` transaction state.
   * Returns the updated transaction or null if none.
   */
  const getUserTransactions = async (
    currentPendingTx?: PendingUserTransaction,
  ): Promise<PendingUserTransaction | null> => {
    const ongoingBridgeTx = useTariAccount.getState().ongoingBridgeTx
    const tariAccount = useTariAccount.getState().tariAccount
    console.warn('[ TAPPLET-BRIDGE ] GET USER TX state', ongoingBridgeTx)
    console.warn('[ TAPPLET-BRIDGE ] GET USER arg func', currentPendingTx)

    if (!tariAccount) return null
    const walletAddress = tariAccount.address
    const { transactions } = await getUserTxs.mutateAsync(walletAddress)
    console.error('[ TAPPLET-BRIDGE ] fetche backend tx', transactions)
    if (Array.isArray(transactions) && transactions.length > 0) {
      // Find a pending transaction
      const ongoing = transactions.find(
        (tx) =>
          tx.status === UserTransactionDTO.status.PENDING ||
          tx.status === UserTransactionDTO.status.PROCESSING ||
          tx.status === UserTransactionDTO.status.TOKENS_RECEIVED,
      )
      console.error(
        '[ TAPPLET-BRIDGE ] same id? ',
        ongoingBridgeTx?.paymentId === ongoing?.paymentId,
      )

      if (ongoing) {
        setOngoingTransaction(ongoing)
        return ongoing
      }
      console.error('[ TAPPLET-BRIDGE ] FOUND ONGOING ', ongoing)
      // If no pending tx found, but previously had one, check if it succeeded/failed
      const ongoingCompleted = transactions.find(
        (tx) =>
          (tx.status === UserTransactionDTO.status.SUCCESS ||
            tx.status === UserTransactionDTO.status.TIMEOUT) &&
          tx.paymentId === ongoingBridgeTx?.paymentId,
      )

      console.error(
        '[ TAPPLET-BRIDGE ] same ongoingCompleted id? ',
        ongoingBridgeTx?.paymentId === ongoingCompleted?.paymentId,
      )
      console.error('[ TAPPLET-BRIDGE ] FOUND COMPLETED ', ongoingCompleted)
      if (ongoingCompleted) {
        console.error('[ TAPPLET-BRIDGE ] SET COMPLETED ', ongoingCompleted)
        setOngoingTransaction(ongoingCompleted)
        return ongoingCompleted
      }
    } else {
      // No transactions found, clear any pending transaction
      console.error('[ TAPPLET-BRIDGE ] REMOVE ONGOING', ongoingBridgeTx)
      removeOngoingTransaction()
    }

    return null
  }

  return {
    getUserTransactions,
  }
}
