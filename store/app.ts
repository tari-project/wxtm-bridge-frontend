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

const useAppStore = create<AppStoreState>()((_, get) => ({
  ...initialState,
  getSupportedChains: () => {
    const isMainNet = get().isMainNet
    return isMainNet ? supportedChains.filter((c) => c.id === 1) : supportedChains.filter((c) => c.id !== 1)
  },
}))

export const setAppConfig = async () => {
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
    useAppStore.setState({
      walletConnectProjectId: walletconnectId,
      bridgeAPI: bridgeAPI,
      isMainNet,
    })

    // set OpenAPI configuration
    OpenAPI.BASE = bridgeAPI

    const appLanguage = await signer.getAppLanguage()
    if (appLanguage) await setLanguage(appLanguage)

    return walletconnectId
  } catch (error) {
    console.error('[ TAPPLET-BRIDGE ] error setting the Bridge app config ', error)
  }
}

export const setLanguage = async (languageCode: string) => {
  try {
    if (i18next.language !== languageCode) {
      useAppStore.setState({
        language: languageCode,
      })
      console.info(`Changing current language ${i18next.language} to ${languageCode}`)
      await changeLanguage(languageCode)
    }
  } catch (e) {
    console.error('Could not set language:', e)
  }
}

export const setUnwrapEnabled = (unwrapEnabled: boolean) => {
  console.info(`Unwrap enabled: ${unwrapEnabled}`)
  useAppStore.setState({ unwrapEnabled })
}

export const setTheme = (theme: string) => {
  const parsedTheme = parseTheme(theme)
  console.info(`Changing theme to ${parsedTheme}`)
  useAppStore.setState({
    theme: parsedTheme,
  })
}

export default useAppStore
