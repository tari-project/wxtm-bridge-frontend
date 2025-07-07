import { useMutation } from '@tanstack/react-query'

import {
  WrapTokenService,
  UserTransactionDTO,
} from '@tari-project/wxtm-bridge-backend-api'

import useTariAccountStore from '@/store/account'
import { OngoingUserTransaction } from '@/types/tapplet'
import { BackendBridgeTransaction } from '@/types/transactions'

export const useBridgeTransaction = () => {
  const getUserTxs = useMutation({
    mutationFn: WrapTokenService.getUserTransactions,
  })

  const setOngoingTransaction =
    useTariAccountStore.getState().setOngoingTransaction
  const removeOngoingTransaction =
    useTariAccountStore.getState().removeOngoingTransaction

  /**
   * Fetch user bridge transactions and update the store's ongoing transaction state.
   * Returns the updated ongoing transaction or null if none.
   */
  const getUserBackendBridgeTxs = async (
    getFromTU = false,
  ): Promise<OngoingUserTransaction | null> => {
    const ongoingBridgeTx = useTariAccountStore.getState().ongoingBridgeTx
    const setBackendBridgeTxs =
      useTariAccountStore.getState().setBackendBridgeTxs
    const lastOngoingPaymentIdFromTU =
      useTariAccountStore.getState().lastOngoingPaymentIdFromTU
    const tariAccount = useTariAccountStore.getState().tariAccount
    const getBackendBridgeTxsFromTU =
      useTariAccountStore.getState().getBackendBridgeTxsFromTU

    if (!tariAccount) return null
    const walletAddress = tariAccount.address

    console.info(
      `🚀 [ TAPPLET-BRIDGE ] get user txs from ${getFromTU ? 'TU' : 'backend'}`,
    )
    let transactions: BackendBridgeTransaction[]
    if (getFromTU) {
      transactions = await getBackendBridgeTxsFromTU()
    } else {
      const result = await getUserTxs.mutateAsync(walletAddress)
      transactions = result.transactions
      setBackendBridgeTxs(transactions)
    }

    if (Array.isArray(transactions) && transactions.length > 0) {
      // Find a pending transaction
      const ongoing = transactions.find(
        (tx) =>
          tx.status === UserTransactionDTO.status.PENDING ||
          tx.status === UserTransactionDTO.status.PROCESSING ||
          tx.status === UserTransactionDTO.status.TOKENS_RECEIVED,
      )
      if (ongoing) {
        // update only if tx has changed
        if (
          ongoing.paymentId !== ongoingBridgeTx?.paymentId ||
          ongoing.status !== ongoingBridgeTx?.status
        )
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
    getUserBackendBridgeTxs,
  }
}
