import { AccountData, OngoingUserTransaction } from '@/types/tapplet'
import { create } from 'zustand'
import useTariSigner from './signer'
import { BackendBridgeTransaction, BackendUnwrapTransaction, CombinedBridgeTransaction } from '@/types/transactions'

interface State {
  tariAccount?: AccountData
  availableBalance: number
  ongoingBridgeTx?: OngoingUserTransaction
  lastOngoingPaymentIdFromTU: string
  backendBridgeTxs: BackendBridgeTransaction[]
  backendUnwrapTxs: BackendUnwrapTransaction[]
  combinedBridgeTxs: CombinedBridgeTransaction[]
  detailedTx?: CombinedBridgeTransaction | null
  exceededDailyLimit: boolean
}

interface Actions {
  setTariAccount: () => Promise<void>
  setLastOngoingBridgeTx: (tx: OngoingUserTransaction) => void
  setBackendBridgeTxs: (txs: BackendBridgeTransaction[]) => void
  setBackendUnwrapTxs: (txs: BackendUnwrapTransaction[]) => void
  setCombinedBridgeTxs: (wrapTxs: BackendBridgeTransaction[], unwrapTxs: BackendUnwrapTransaction[]) => void
  removeOngoingTransaction: () => void
  getBackendBridgeTxsFromTU: () => Promise<BackendBridgeTransaction[]>
  setDetailedTx: (detailedTx: CombinedBridgeTransaction | null) => void
  setExceededDailyLimit: (exceededDailyLimit: boolean) => void
}

type TariL1WalletStoreState = State & Actions

const initialState: State = {
  tariAccount: {
    account_id: 0,
    address: '',
  },
  availableBalance: 0,
  ongoingBridgeTx: undefined,
  lastOngoingPaymentIdFromTU: '',
  backendBridgeTxs: [],
  backendUnwrapTxs: [],
  combinedBridgeTxs: [],
  exceededDailyLimit: false,
}

export const useTariAccountStore = create<TariL1WalletStoreState>()((set) => ({
  ...initialState,
  setTariAccount: async () => {
    const signer = useTariSigner.getState().signer
    // if (process.env.NODE_ENV === 'development') return
    try {
      if (!signer) {
        console.error('[ TAPPLET-BRIDGE ] signer undefined')
        return
      }
      const account = await signer.getAccount()
      const balance = await signer.getTariBalance()
      const ongoingBridgeTx = await signer.getOngoingBridgeTx()
      set({
        tariAccount: {
          account_id: account.account_id,
          address: account.address,
        },
        availableBalance: balance?.available_balance || 0,
        lastOngoingPaymentIdFromTU: ongoingBridgeTx?.paymentId ?? '',
      })

      return
    } catch (error) {
      console.error('[ TAPPLET-BRIDGE ] error setting the Tari account: ', error)
    }
  },

  setLastOngoingBridgeTx: (tx: OngoingUserTransaction) => {
    set({
      ongoingBridgeTx: tx,
    })
  },
  removeOngoingTransaction: () => {
    set({
      ongoingBridgeTx: undefined,
      lastOngoingPaymentIdFromTU: '',
    })
  },
  getBackendBridgeTxsFromTU: async () => {
    const signer = useTariSigner.getState().signer
    try {
      if (!signer) {
        console.error('[ TAPPLET-BRIDGE ] signer undefined')
        return []
      }
      const backendBridgeTxs = await signer.getBackendBridgeTxs()

      set({
        backendBridgeTxs: backendBridgeTxs,
      })
      return backendBridgeTxs
    } catch (error) {
      console.error('[ TAPPLET-BRIDGE ] error getting bridge transactions:', error)
      return []
    }
  },
  setBackendBridgeTxs: (txs: BackendBridgeTransaction[]) => {
    set({
      backendBridgeTxs: txs,
    })
  },
  setBackendUnwrapTxs: (txs: BackendUnwrapTransaction[]) => {
    set({
      backendUnwrapTxs: txs,
    })
  },
  setCombinedBridgeTxs: (wrapTxs: BackendBridgeTransaction[], unwrapTxs: BackendUnwrapTransaction[]) => {
    const combined: CombinedBridgeTransaction[] = [
      ...wrapTxs.map((tx) => ({ ...tx, type: 'wrap' as const })),
      ...unwrapTxs.map((tx) => ({ ...tx, type: 'unwrap' as const })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    set({
      combinedBridgeTxs: combined,
    })
  },
  setDetailedTx: (detailedTx: CombinedBridgeTransaction | null) =>
    set({
      detailedTx: detailedTx,
    }),
  setExceededDailyLimit: (exceededDailyLimit: boolean) => set({ exceededDailyLimit }),
}))

export default useTariAccountStore
