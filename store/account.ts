import { AccountData, PendingUserTransaction } from '@/types/tapplet'
import { create } from 'zustand'
import useTariSigner from './signer'
import { BridgeTxDetails } from '@/clients/tari-l1-signer'
import { OpenAPI } from '@tari-project/wxtm-bridge-backend-api'

interface State {
  tariAccount?: AccountData
  availableBalance: number
  isProcessingTransaction: boolean
  pendingBridgeTx?: PendingUserTransaction
  pendingBridgeTxFromTU?: BridgeTxDetails
  language: string
  walletConnectId: string
  bridgeApi: string
  wrapTokenFeePercentageBps: number
  tariColdWalletAddress: string
  walletConnected: boolean
}

interface Actions {
  setTariAccount: () => Promise<string | undefined>
  setPendingTransaction: (tx: PendingUserTransaction) => void
  removePendingTransaction: () => void
  setWrapTokenFeePercentageBps: (fee: number) => void
  setTariColdWalletAddress: (address: string) => void
  setWalletConnected: (connected: boolean) => void
  disconnect: () => void
}

type OotleWalletStoreState = State & Actions

const initialState: State = {
  tariAccount: {
    account_id: 0,
    address: '',
  },
  availableBalance: 0,
  pendingBridgeTx: undefined,
  isProcessingTransaction: false,
  pendingBridgeTxFromTU: undefined,
  language: '',
  walletConnectId: '',
  
  bridgeApi: '',
  wrapTokenFeePercentageBps: 50, // 0.5% fee
  tariColdWalletAddress: '',
  walletConnected: false,
}

export const useTariAccount = create<OotleWalletStoreState>()((set) => {
  // Rehydrate state from localStorage on initial load
  let rehydratedConnected = false
  if (typeof window !== 'undefined') {
    rehydratedConnected = localStorage.getItem('walletConnected') === 'true'
  }

  return {
    ...initialState,
    walletConnected: rehydratedConnected,
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
        availableBalance: balance?.available_balance ?? 0,
        language: language,
        walletConnectId: envs?.[0] ?? '',
        bridgeApi: envs?.[1] ?? '',
        walletConnected: true,
      })
      localStorage.setItem('walletConnected', 'true')
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
  setWrapTokenFeePercentageBps: (fee: number) => {
    set({
      wrapTokenFeePercentageBps: fee,
    })
  },
  setTariColdWalletAddress: (address: string) => {
    set({
      tariColdWalletAddress: address,
    })
  },
  setWalletConnected: (connected: boolean) => {
    set({ walletConnected: connected })
  },
  disconnect: () => {
    set({ ...initialState })
    localStorage.removeItem('walletConnected')
  },
}))

export default useTariAccount
