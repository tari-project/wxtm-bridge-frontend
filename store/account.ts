import { AccountData, OngoingUserTransaction } from '@/types/tapplet'
import { create } from 'zustand'
import useTariSigner from './signer'
import { BackendBridgeTransaction } from '@/types/transactions'

interface State {
  tariAccount?: AccountData
  availableBalance: number
  ongoingBridgeTx?: OngoingUserTransaction
  lastOngoingPaymentIdFromTU: string
  backendBridgeTxs: BackendBridgeTransaction[]
  detailedTx?: BackendBridgeTransaction | null
}

interface Actions {
  setTariAccount: () => Promise<void>
  setLastOngoingBridgeTx: (tx: OngoingUserTransaction) => void
  setBackendBridgeTxs: (txs: BackendBridgeTransaction[]) => void
  removeOngoingTransaction: () => void
  getBackendBridgeTxsFromTU: () => Promise<BackendBridgeTransaction[]>
  setDetailedTx: (detailedTx: BackendBridgeTransaction | null) => void
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
}

export const useTariAccountStore = create<TariL1WalletStoreState>()((set) => ({
  ...initialState,
  setTariAccount: async () => {
    const signer = useTariSigner.getState().signer
    if (process.env.NODE_ENV === 'development') return
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
        availableBalance: balance.available_balance,
        lastOngoingPaymentIdFromTU: ongoingBridgeTx?.paymentId ?? '',
      })

      return
    } catch (error) {
      console.error(
        '[ TAPPLET-BRIDGE ] error setting the Tari account: ',
        error,
      )
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
      console.error(
        '[ TAPPLET-BRIDGE ] error getting bridge transactions:',
        error,
      )
      return []
    }
  },
  setBackendBridgeTxs: (txs: BackendBridgeTransaction[]) => {
    set({
      backendBridgeTxs: txs,
    })
  },
  setDetailedTx: (detailedTx: BackendBridgeTransaction | null) =>
    set({
      detailedTx: detailedTx,
    }),
}))

export default useTariAccountStore
