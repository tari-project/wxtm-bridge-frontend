import { config } from '@/config'
import { useMutation } from '@tanstack/react-query'

import {
  WrapTokenService,
  OpenAPI,
  UserTransactionDTO,
} from '@tari-project/wxtm-bridge-backend-api'

import useTariAccount from '@/store/account'
import { PendingUserTransaction } from '@/types/tapplet'

OpenAPI.BASE = config.BACKEND_API_URL

export const useBridgeTransaction = () => {
  const getUserTxs = useMutation({
    mutationFn: WrapTokenService.getUserTransactions,
  })

  const { setPendingTransaction, removePendingTransaction } = useTariAccount()

  const getUserTransactions = async (
    walletAddress: string,
    pendingBridgeTx?: PendingUserTransaction,
  ) => {
    const { transactions } = await getUserTxs.mutateAsync(walletAddress)

    if (Array.isArray(transactions) && transactions.length > 0) {
      // check if new tx has status PENDING and if so, add to store
      const pending = transactions.find(
        (tx) => tx.status === UserTransactionDTO.status.PENDING,
      )
      if (pending) {
        setPendingTransaction(pending)
        return
      }

      // double check to remove pending tx which is already success
      const success = transactions.find(
        (tx) => tx.status === UserTransactionDTO.status.SUCCESS,
      )
      if (pendingBridgeTx && pendingBridgeTx.createdAt == success?.createdAt)
        removePendingTransaction()
    }

    return {
      transactions,
    }
  }

  return {
    getUserTransactions,
  }
}
