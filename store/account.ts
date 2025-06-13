import { AccountData, PendingUserTransaction } from '@/types/tapplet'
import { create } from 'zustand'
import useTariSigner from './signer'
import { OpenAPI } from '@tari-project/wxtm-bridge-backend-api'
import i18next, { changeLanguage } from 'i18next'

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
  setLanguage: (language: string) => Promise<void>
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
  language: 'en',
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
      // TODO move this app config data to separate store and init fct
      const appLanguage = await signer.getAppLanguage()
      const envs = await signer.getBridgeEnvs()
      console.error('[ TAPPLET-BRIDGE ] language', appLanguage)
      const id = envs?.[0] ?? ''
      set({
        tariAccount: {
          account_id: account.account_id,
          address: account.address,
        },
        available_balance: balance?.available_balance ?? 0,
        language: appLanguage,
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
      lastOngoingPaymentIdFromTU: '',
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
  setLanguage: async (languageCode: string) => {
    try {
      if (i18next.language !== languageCode) {
        set({
          language: languageCode,
        })
        console.info(
          `Changing current language ${i18next.language} to ${languageCode}`,
        )
        await changeLanguage(languageCode)
      }
    } catch (e) {
      console.error('Could not set language:', e)
    }
  },
}))

export default useTariAccount
