import { create } from 'zustand'
import useTariSigner from './signer'
import { OpenAPI } from '@tari-project/wxtm-bridge-backend-api'
import i18next, { changeLanguage } from 'i18next'
import { parseTheme, Theme } from '@/types/app'

interface State {
  language: string
  walletConnectProjectId: string
  bridgeAPI: string
  theme: Theme
}

interface Actions {
  setAppConfig: () => Promise<string | undefined>
  setLanguage: (language: string) => Promise<void>
  setTheme: (theme: string) => void
}

type AppStoreState = State & Actions

const initialState: State = {
  language: 'en',
  walletConnectProjectId: '',
  bridgeAPI: '',
  theme: 'light',
}

export const useAppStore = create<AppStoreState>()((set) => ({
  ...initialState,
  setAppConfig: async () => {
    const signer = useTariSigner.getState().signer

    try {
      if (!signer) {
        console.error('[ TAPPLET-BRIDGE ] signer undefined')
        return
      }

      const envs = await signer.getBridgeEnvs()
      const walletconnectId = envs?.[0] ?? ''
      const bridgeAPI = envs?.[1] ?? ''
      set({
        walletConnectProjectId: walletconnectId,
        bridgeAPI: bridgeAPI,
      })

      // set OpenAPI configuration
      OpenAPI.BASE = bridgeAPI

      const appLanguage = await signer.getAppLanguage()
      if (appLanguage) await useAppStore.getState().setLanguage(appLanguage)

      return walletconnectId
    } catch (error) {
      console.error(
        '[ TAPPLET-BRIDGE ] error setting the Bridge app config ',
        error,
      )
    }
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
  setTheme: (theme: string) => {
    const parsedTheme = parseTheme(theme)
    console.info(`Changing theme to ${parsedTheme}`)
    set({
      theme: parsedTheme,
    })
  },
}))

export default useAppStore
