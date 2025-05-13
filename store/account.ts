import { AccountData, PendingBridgeTx } from '@/types/tapplet'
import { create } from 'zustand'
import useTariSigner from './signer'

interface State {
  tariAccount?: AccountData
  available_balance: number
  pendingBridgeTx: PendingBridgeTx[] //TODO fetch with tari signer
}

interface Actions {
  setTariAccount: () => Promise<void>
  addPendingBridgeTx: (newTx: PendingBridgeTx) => void
  removePendingBridgeTx: (paymentId: string) => void
}

type OotleWalletStoreState = State & Actions

const initialState: State = {
  tariAccount: {
    account_id: 0,
    address:
      'f25V4MStkUBE8UaD1Ar84KropPKLNSJLN5XUZFzSkMEv6u2AQYAsGTkwx5Lj5WcjWnTxGyDPfwPgh6hnw5BQX1G7T8C',
  },
  available_balance: 0,
  pendingBridgeTx: [],
}

export const useTariAccount = create<OotleWalletStoreState>()((set) => ({
  ...initialState,
  setTariAccount: async () => {
    console.warn('Try to set the Tari acc')
    const signer = useTariSigner.getState().signer
    console.warn('Try to set the Tari signer', signer)
    try {
      if (!signer) {
        return
      }
      console.warn('[TAPPLET-BRIDGE ]Try to set the Tari account: ')
      const account = await signer.getAccount()
      console.warn('[TAPPLET-BRIDGE ]Tari account: ', account.address)
      const isTariConnected = await signer.isConnected()
      console.warn('[TAPPLET-BRIDGE ]is connected? ', isTariConnected)
      const balance = await signer.getTariBalance()
      console.warn('[TAPPLET-BRIDGE ]balance ', { balance })
      set({
        tariAccount: {
          account_id: account.account_id,
          address: account.address,
        },
        available_balance: balance.available_balance,
      })
    } catch (error) {
      console.error('Could not set the Tari account: ', error)
    }
  },
  addPendingBridgeTx: (newTx: PendingBridgeTx) =>
    set((state) => ({
      pendingBridgeTx: [...state.pendingBridgeTx, newTx],
    })),
  removePendingBridgeTx: (paymentId: string) =>
    set((state) => ({
      pendingBridgeTx: state.pendingBridgeTx.filter(
        (tx) => tx.paymentId !== paymentId,
      ),
    })),
}))

export default useTariAccount
