import { create } from 'zustand'
import useTariSigner from './signer'
import { OpenAPI } from '@tari-project/wxtm-bridge-backend-api'
import i18next, { changeLanguage } from 'i18next'
import { parseTheme, Theme } from '@/types/app'
import { SupportedChain, supportedChains } from '@/utils/networksConfig'

interface State {
  language: string
  walletConnectProjectId: string
  bridgeAPI: string
  theme: Theme
  hideWalletBalance: boolean
  unwrapEnabled: boolean
  isMainNet: boolean
}

interface Actions {
  setAppConfig: () => Promise<string | undefined>
  setLanguage: (language: string) => Promise<void>
  setTheme: (theme: string) => void
  setUnwrapEnabled: (unwrapEnabled: boolean) => void
  getSupportedChains: () => SupportedChain[]
}

type AppStoreState = State & Actions

const initialState: State = {
  language: 'en',
  walletConnectProjectId: '',
  bridgeAPI: '',
  theme: 'light',
  hideWalletBalance: false,
  unwrapEnabled: false,
  isMainNet: true,
}

export const useAppStore = create<AppStoreState>()((set, get) => ({
  ...initialState,
  setAppConfig: async () => {
    const signer = useTariSigner.getState().signer

    try {
      if (!signer) {
        console.error('[ TAPPLET-BRIDGE ] signer undefined')
        return
      }

      const network = await signer.getNetwork()
      const isMainNet = network?.toLowerCase() === 'mainnet'

      const envs =
        process.env.NODE_ENV === 'development'
          ? [process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID, process.env.NEXT_PUBLIC_BACKEND_API_URL]
          : await signer.getBridgeEnvs()

      const walletconnectId = envs?.[0] ?? ''
      const bridgeAPI = envs?.[1] ?? ''
      set({
        walletConnectProjectId: walletconnectId,
        bridgeAPI: bridgeAPI,
        isMainNet,
      })

      // set OpenAPI configuration
      OpenAPI.BASE = bridgeAPI

      const appLanguage = await signer.getAppLanguage()
      if (appLanguage) await useAppStore.getState().setLanguage(appLanguage)

      return walletconnectId
    } catch (error) {
      console.error('[ TAPPLET-BRIDGE ] error setting the Bridge app config ', error)
    }
  },
  setLanguage: async (languageCode: string) => {
    try {
      if (i18next.language !== languageCode) {
        set({
          language: languageCode,
        })
        console.info(`Changing current language ${i18next.language} to ${languageCode}`)
        await changeLanguage(languageCode)
      }
    } catch (e) {
      console.error('Could not set language:', e)
    }
  },
  setTheme: (theme: string) => {
    const parsedTheme = parseTheme(theme)
    console.info(`Changing theme to ${parsedTheme}`)
    set({
      theme: parsedTheme,
    })
  },
  setUnwrapEnabled: (unwrapEnabled: boolean) => {
    console.info(`Unwrap enabled: ${unwrapEnabled}`)
    set({ unwrapEnabled })
  },
  setHideWalletBalance: (hideBalance: boolean) => {
    set({
      hideWalletBalance: hideBalance,
    })
  },
  getSupportedChains: () => {
    const { isMainNet } = get()
    return isMainNet ? supportedChains.filter((c) => c.id === 1) : supportedChains.filter((c) => c.id !== 1)
  },
}))

export default useAppStore
