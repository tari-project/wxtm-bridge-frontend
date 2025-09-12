import { useMutation } from '@tanstack/react-query'

import {
  TokensUnwrappedService,
  UserTransactionDTO,
  UserUnwrappedTransactionDTO,
  WrapTokenService,
} from '@tari-project/wxtm-bridge-backend-api'

import useTariAccountStore from '@/store/account'
import { OngoingUserTransaction } from '@/types/tapplet'
import {
  BackendBridgeTransaction,
  BackendUnwrapTransaction,
  CombinedBridgeTransaction,
} from '@/types/transactions'

export const useBridgeTransaction = () => {
  const getUserWrapTxs = useMutation({
    mutationFn: WrapTokenService.getUserTransactions,
  })
  const getUserUnwrapTxs = useMutation({
    mutationFn: TokensUnwrappedService.getUserTransactions,
  })

  const setLastOngoingBridgeTx =
    useTariAccountStore.getState().setLastOngoingBridgeTx
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
    const setBackendUnwrapTxs =
      useTariAccountStore.getState().setBackendUnwrapTxs
    const setCombinedBridgeTxs =
      useTariAccountStore.getState().setCombinedBridgeTxs
    const lastOngoingPaymentIdFromTU =
      useTariAccountStore.getState().lastOngoingPaymentIdFromTU
    const tariAccount = useTariAccountStore.getState().tariAccount
    const getBackendBridgeTxsFromTU =
      useTariAccountStore.getState().getBackendBridgeTxsFromTU

    if (!tariAccount) return null
    const walletAddress = tariAccount.address

    console.debug(
      `[ TAPPLET-BRIDGE ] get txs from ${getFromTU ? 'TU' : 'backend'}`,
    )

    let wrapTransactions: BackendBridgeTransaction[] = []
    let unwrapTransactions: BackendUnwrapTransaction[] = []
    let combinedTransactions: CombinedBridgeTransaction[] = []

    if (getFromTU) {
      /** @TODO We would need to add getter for unwraps in TU and add those in below combinedTransactions */
      wrapTransactions = await getBackendBridgeTxsFromTU()
      combinedTransactions = wrapTransactions.map((tx) => ({
        ...tx,
        type: 'wrap' as const,
      }))
    } else {
      const wrapResult = await getUserWrapTxs.mutateAsync(walletAddress)
      const unwrapResult = await getUserUnwrapTxs.mutateAsync(walletAddress)

      wrapTransactions = wrapResult.transactions
      unwrapTransactions = unwrapResult.transactions

      setBackendBridgeTxs(wrapTransactions)
      setBackendUnwrapTxs(unwrapTransactions)
      setCombinedBridgeTxs(wrapTransactions, unwrapTransactions)

      combinedTransactions = [
        ...wrapTransactions.map((tx) => ({ ...tx, type: 'wrap' as const })),
        ...unwrapTransactions.map((tx) => ({ ...tx, type: 'unwrap' as const })),
      ]

      combinedTransactions.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA // Sort descending by date
      })
    }

    if (
      Array.isArray(combinedTransactions) &&
      combinedTransactions.length > 0
    ) {
      // Find a pending transaction (checking both wrap and unwrap statuses)
      const ongoing = combinedTransactions.find((tx) => {
        if (tx.type === 'wrap') {
          return (
            tx.status === UserTransactionDTO.status.PENDING ||
            tx.status === UserTransactionDTO.status.PROCESSING ||
            tx.status === UserTransactionDTO.status.TOKENS_RECEIVED
          )
        } else {
          return (
            tx.status === UserUnwrappedTransactionDTO.status.PENDING ||
            tx.status === UserUnwrappedTransactionDTO.status.PROCESSING
          )
        }
      })
      if (ongoing) {
        if (
          (ongoing.paymentId !== ongoingBridgeTx?.paymentId ||
            ongoing.status !== ongoingBridgeTx?.status) &&
          (!ongoingBridgeTx ||
            new Date(ongoing.createdAt).getTime() >
              new Date(ongoingBridgeTx?.createdAt).getTime())
        ) {
          const ongoingTransaction: OngoingUserTransaction = ongoing
          setLastOngoingBridgeTx(ongoingTransaction)
        }
        return ongoing
      }

      // If no pending tx found, but previously had one, check if it succeeded/failed
      // check also with the paymentId from the TU to display modal after the bridge relaunch
      const validPaymentIds = new Set([
        ongoingBridgeTx?.paymentId,
        lastOngoingPaymentIdFromTU,
      ])
      const ongoingCompleted = combinedTransactions.find((tx) => {
        const paymentId = tx.paymentId
        const hasValidPaymentId = validPaymentIds.has(paymentId)

        if (tx.type === 'wrap') {
          return (
            hasValidPaymentId &&
            (tx.status === UserTransactionDTO.status.SUCCESS ||
              tx.status === UserTransactionDTO.status.TIMEOUT)
          )
        } else {
          return (
            hasValidPaymentId &&
            (tx.status === UserUnwrappedTransactionDTO.status.SUCCESS ||
              tx.status === UserUnwrappedTransactionDTO.status.ERROR)
          )
        }
      })

      if (ongoingCompleted) {
        const ongoingTransaction: OngoingUserTransaction = {
          ...ongoingCompleted,
          showModal: true,
        }
        setLastOngoingBridgeTx(ongoingTransaction)
        return ongoingTransaction
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
