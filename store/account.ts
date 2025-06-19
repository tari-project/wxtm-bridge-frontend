import {
  AccountData,
  BackendBridgeTransaction,
  OngoingUserTransaction,
} from '@/types/tapplet'
import { create } from 'zustand'
import useTariSigner from './signer'

interface State {
  tariAccount?: AccountData
  availableBalance: number
  ongoingBridgeTx?: OngoingUserTransaction
  lastOngoingPaymentIdFromTU: string
  backendBridgeTxs: BackendBridgeTransaction[]
}

interface Actions {
  setTariAccount: () => Promise<void>
  setOngoingTransaction: (tx: OngoingUserTransaction) => void
  removeOngoingTransaction: () => void
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
      const backendBridgeTxs = await signer.getBackendBridgeTxs()
      set({
        tariAccount: {
          account_id: account.account_id,
          address: account.address,
        },
        availableBalance: balance.available_balance,
        lastOngoingPaymentIdFromTU: ongoingBridgeTx?.paymentId ?? '',
        backendBridgeTxs: backendBridgeTxs,
      })

      return
    } catch (error) {
      console.error(
        '[ TAPPLET-BRIDGE ] error setting the Tari account: ',
        error,
      )
    }
  },

  setOngoingTransaction: (tx: OngoingUserTransaction) => {
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
  getBackendBridgeTxs: async () => {
    const signer = useTariSigner.getState().signer
    try {
      if (!signer) {
        console.error('[ TAPPLET-BRIDGE ] signer undefined')
        return
      }
      const backendBridgeTxs = await signer.getBackendBridgeTxs()
      set({
        backendBridgeTxs: backendBridgeTxs,
      })
    } catch (error) {
      console.error(
        '[ TAPPLET-BRIDGE ] error getting bridge transactions:',
        error,
      )
    }
  },
}))

export default useTariAccountStore
