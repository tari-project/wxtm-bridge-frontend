import { AccountData } from '@/types/tapplet'
import { create } from 'zustand'
import useTariSigner from './signer'
import { BridgeTxDetails } from '@/clients/tari-l1-signer'

interface State {
  tariAccount?: AccountData
  available_balance: number
  pendingBridgeTx: string[]
  isProcessingTransaction: boolean
  pendingBridgeTxFromTU?: BridgeTxDetails
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
  pendingBridgeTxFromTU: undefined,
}

export const useTariAccount = create<OotleWalletStoreState>()((set) => ({
  ...initialState,
  setTariAccount: async () => {
    const signer = useTariSigner.getState().signer
    try {
      if (!signer) {
        console.error('[ TAPPLET-BRIDGE ] signer undefined')
        return
      }
      const account = await signer.getAccount()
      const balance = await signer.getTariBalance()
      // TODO temp solution if backend is not ready to be fetched
      const pendingTx = await signer.getPendingTappletTx()
      set({
        tariAccount: {
          account_id: account.account_id,
          address: account.address,
        },
        available_balance: balance?.available_balance ?? 0,
        pendingBridgeTxFromTU: pendingTx,
        isProcessingTransaction: !!pendingTx,
      })
    } catch (error) {
      console.error(
        '[ TAPPLET-BRIDGE ] error setting the Tari account: ',
        error,
      )
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
