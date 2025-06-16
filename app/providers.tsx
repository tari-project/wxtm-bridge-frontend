'use client'

import { ReactNode, useState, useEffect } from 'react'
import { WagmiProvider, State, Config } from 'wagmi'
import { getConfig } from '@/utils/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cookieToInitialState } from 'wagmi'
import useTariAccountStore from '@/store/account'
import useTariSignerStore from '@/store/signer'
import { TariL1SignerParameters } from '@/types/tapplet'
import TariL1Signer from '@/clients/tari-l1-signer'
import { MessageType, useIframeMessage } from '@/utils/useIframeMessage'
import useAppStore from '@/store/app'

export const Providers = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<Config | null>(null)
  const [queryClient] = useState(() => new QueryClient())
  const [initialState, setInitialState] = useState<State | undefined>(undefined)
  const setTariAccount = useTariAccountStore((s) => s.setTariAccount)
  const setAppConfig = useAppStore((s) => s.setAppConfig)
  const signer = useTariSignerStore((s) => s.signer)
  const setSigner = useTariSignerStore((s) => s.setSigner)
  const projectId = useAppStore((s) => s.walletConnectProjectId)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const setTheme = useAppStore((s) => s.setTheme)

  // Auto-connect if projectId is set
  useEffect(() => {
    if (projectId) {
      const cfg = getConfig(projectId)
      setConfig(cfg)
      const cookieHeader = document.cookie
      const state = cookieToInitialState(cfg, cookieHeader)
      setInitialState(state)
    }
  }, [projectId])

  // Initialize signer and account on mount
  useEffect(() => {
    const initializeSignerAndAccount = async () => {
      try {
        if (!signer) {
          const signerParams: TariL1SignerParameters = {
            name: 'TariL1Signer',
            onConnection: setTariAccount,
          }
          const newSigner = new TariL1Signer(signerParams)
          setSigner(newSigner)
        }
        const id = await setAppConfig()
        // If projectId is not set yet, set config here as fallback
        if (!projectId && id) {
          const cfg = getConfig(id)
          setConfig(cfg)
          const cookieHeader = document.cookie
          const state = cookieToInitialState(cfg, cookieHeader)
          setInitialState(state)
        }
      } catch (error) {
        console.error('[ TAPPLET-BRIDGE ] Failed to set Tari Account:', error)
      }
    }
    initializeSignerAndAccount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSigner, setTariAccount, signer])

  useIframeMessage((event) => {
    switch (event.data.type) {
      case MessageType.SET_LANGUAGE:
        const language = event.data.payload.language
        setLanguage(language)
        break
      case MessageType.SET_THEME:
        const theme = event.data.payload.theme
        setTheme(theme)
        break
    }
  })
  if (!initialState)
    console.debug('[ TAPPLET-BRIDGE ] provider initial state undefined')

  if (!config) {
    console.debug('[ TAPPLET-BRIDGE ] provider config undefined')
    return (
      <div className="h-5 w-5 animate-spin rounded-full border-b-[3px] border-white"></div>
    )
  }

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
