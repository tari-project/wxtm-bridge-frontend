import { AccountData, PendingUserTransaction } from '@/types/tapplet'
import { create } from 'zustand'
import useTariSigner from './signer'
import { BridgeTxDetails } from '@/clients/tari-l1-signer'
import { OpenAPI } from '@tari-project/wxtm-bridge-backend-api'

interface State {
  tariAccount?: AccountData
  available_balance: number
  isProcessingTransaction: boolean
  pendingBridgeTx?: PendingUserTransaction
  pendingBridgeTxFromTU?: BridgeTxDetails
  language: string
  walletconnect_id: string
  bridge_api: string
}

interface Actions {
  setTariAccount: () => Promise<string | undefined>
  setPendingTransaction: (tx: PendingUserTransaction) => void
  removePendingTransaction: () => void
}

type OotleWalletStoreState = State & Actions

const initialState: State = {
  tariAccount: {
    account_id: 0,
    address: '',
  },
  available_balance: 0,
  pendingBridgeTx: undefined,
  isProcessingTransaction: false,
  pendingBridgeTxFromTU: undefined,
  language: '',
  walletconnect_id: '',
  bridge_api: '',
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
      const language = await signer.getAppLanguage()
      const envs = await signer.getBridgeEnvs()
      const id = envs?.[0] ?? ''
      set({
        tariAccount: {
          account_id: account.account_id,
          address: account.address,
        },
        available_balance: balance?.available_balance ?? 0,
        language: language,
        walletconnect_id: envs?.[0] ?? '',
        bridge_api: envs?.[1] ?? '',
      })
      OpenAPI.BASE = envs?.[1] ?? ''
      return id ?? ''
    } catch (error) {
      console.error(
        '[ TAPPLET-BRIDGE ] error setting the Tari account: ',
        error,
      )
    }
  },

  setPendingTransaction: (tx: PendingUserTransaction) => {
    set({
      pendingBridgeTx: tx,
      isProcessingTransaction: true,
    })
  },
  removePendingTransaction: () => {
    set({
      pendingBridgeTx: undefined,
      isProcessingTransaction: false,
    })
  },
}))

export default useTariAccount
