import { create } from 'zustand'
import useTariSigner from './signer'
import { OpenAPI } from '@tari-project/wxtm-bridge-backend-api'
import { Theme } from '@/types/app'

interface State {
  language: string
  walletConnectProjectId: string
  bridgeAPI: string
  theme: Theme
}

interface Actions {
  setAppConfig: () => Promise<string | undefined>
  setTheme: (theme: Theme) => void
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
      const language = await signer.getAppLanguage()
      const envs = await signer.getBridgeEnvs()
      const walletconnectId = envs?.[0] ?? ''
      const bridgeAPI = envs?.[1] ?? ''

      set({
        language: language,
        walletConnectProjectId: walletconnectId,
        bridgeAPI: bridgeAPI,
      })

      // set OpenAPI configuration
      OpenAPI.BASE = bridgeAPI

      return walletconnectId
    } catch (error) {
      console.error(
        '[ TAPPLET-BRIDGE ] error setting the Bridge app config ',
        error,
      )
    }
  },
  setTheme: (theme: Theme) => {
    set({
      theme: theme,
    })
  },
}))

export default useAppStore
