import { AccountData, PendingUserTransaction } from '@/types/tapplet'
import { create } from 'zustand'
import useTariSigner from './signer'
import { OpenAPI } from '@tari-project/wxtm-bridge-backend-api'

interface State {
  tariAccount?: AccountData
  available_balance: number
  ongoingBridgeTx?: PendingUserTransaction
  language: string
  walletconnect_id: string
  bridge_api: string
  wrapTokenFeePercentageBps: number
  tariColdWalletAddress: string
  lastOngoingPaymentIdFromTU: string
}

interface Actions {
  setTariAccount: () => Promise<string | undefined>
  setOngoingTransaction: (tx: PendingUserTransaction) => void
  removeOngoingTransaction: () => void
  setWrapTokenFeePercentageBps: (fee: number) => void
  setTariColdWalletAddress: (address: string) => void
}

type TariL1WalletStoreState = State & Actions

const initialState: State = {
  tariAccount: {
    account_id: 0,
    address: '',
  },
  available_balance: 0,
  ongoingBridgeTx: undefined,
  // all below can be moved to separate store
  language: '',
  walletconnect_id: '',
  bridge_api: '',
  wrapTokenFeePercentageBps: 50, // 0.5% fee
  tariColdWalletAddress: '',
  lastOngoingPaymentIdFromTU: '',
}

export const useTariAccount = create<TariL1WalletStoreState>()((set) => ({
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
      const ongoingBridgeTx = await signer.getOngoingBridgeTx()
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
        lastOngoingPaymentIdFromTU: ongoingBridgeTx?.paymentId ?? '',
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

  setOngoingTransaction: (tx: PendingUserTransaction) => {
    set({
      ongoingBridgeTx: tx,
    })
  },
  removeOngoingTransaction: () => {
    set({
      ongoingBridgeTx: undefined,
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
}))

export default useTariAccount
