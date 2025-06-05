import { create } from 'zustand'
import useTariSigner from './signer'
import { OpenAPI } from '@tari-project/wxtm-bridge-backend-api'

interface State {
  language: string
  walletConnectProjectId: string
  bridgeAPI: string
}

interface Actions {
  setAppConfig: () => Promise<string | undefined>
}

type AppStoreState = State & Actions

const initialState: State = {
  language: 'en',
  walletConnectProjectId: '',
  bridgeAPI: '',
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
      //TODO TMP hardcoded
      const walletconnectId = envs?.[0] ?? '89085ba8291ae91cf7e35f57ad60033d'
      const bridgeAPI = envs?.[1] ?? 'https://api.staging-bridge.tari.com'
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
}))

export default useAppStore
