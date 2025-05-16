import { AccountData } from '@/types/tapplet'
import { create } from 'zustand'
import useTariSigner from './signer'

interface State {
  tariAccount?: AccountData
  available_balance: number
  pendingBridgeTx: string[]
  isProcessingTransaction: boolean
}

interface Actions {
  setTariAccount: () => Promise<void>
  addPendingTransaction: (txId: string) => void
  removePendingTransaction: (txId: string) => void
  setProcessingTransaction: (isProcessing: boolean) => void
}

type OotleWalletStoreState = State & Actions

const initialState: State = {
  tariAccount: {
    account_id: 0,
    address: '',
  },
  available_balance: 0,
  pendingBridgeTx: [],
  isProcessingTransaction: false,
}

export const useTariAccount = create<OotleWalletStoreState>()((set) => ({
  ...initialState,
  setTariAccount: async () => {
    console.info('[ TAPPLET-BRIDGE ] set tari account')
    const signer = useTariSigner.getState().signer
    try {
      if (!signer) {
        console.error('[ TAPPLET-BRIDGE ] signer undefined')
        return
      }
      const account = await signer.getAccount()
      const balance = await signer.getTariBalance()
      set({
        tariAccount: {
          account_id: account.account_id,
          address: account.address,
        },
        available_balance: balance?.available_balance ?? 0,
      })
    } catch (error) {
      console.error('Could not set the Tari account: ', error)
    }
  },

  addPendingTransaction: (txId: string) => {
    set((state) => ({
      pendingBridgeTx: [...state.pendingBridgeTx, txId],
      isProcessingTransaction: true,
    }))
  },
  removePendingTransaction: (txId: string) => {
    set((state) => {
      const updatedTxs = state.pendingBridgeTx.filter((id) => id !== txId)
      return {
        pendingBridgeTx: updatedTxs,
        isProcessingTransaction: updatedTxs.length > 0,
      }
    })
  },
  setProcessingTransaction: (isProcessing: boolean) => {
    set({ isProcessingTransaction: isProcessing })
  },
}))

export default useTariAccount
