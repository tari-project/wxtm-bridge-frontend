'use client'

import { ReactNode, useState, useEffect, useRef } from 'react'
import { WagmiProvider, State, Config, cookieToInitialState } from 'wagmi'
import { getConfig } from '@/utils/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTariAccountStore } from '@/store/account'
import { TariL1SignerParameters } from '@/types/tapplet'
import TariL1Signer from '@/clients/tari-l1-signer'
import { MessageType, useIframeMessage } from '@/utils/useIframeMessage'
import useAppStore from '@/store/app'
import useTariSignerStore from '@/store/signer'
import { getInitConfig } from '@/utils/universe'

export const Providers = ({ children }: { children: ReactNode }) => {
  const projectId = useAppStore((s) => s.walletConnectProjectId)
  const signer = useTariSignerStore((s) => s.signer)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const setUnwrapEnabled = useAppStore((s) => s.setUnwrapEnabled)
  const setTheme = useAppStore((s) => s.setTheme)
  const setAppConfig = useAppStore((s) => s.setAppConfig)
  const setSigner = useTariSignerStore((s) => s.setSigner)
  const setTariAccount = useTariAccountStore((s) => s.setTariAccount)
  const [config, setConfig] = useState<Config | null>(null)
  const [initialState, setInitialState] = useState<State | undefined>(undefined)
  const [queryClient] = useState(() => new QueryClient())
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!projectId || initializedRef.current) return

    const cfg = getConfig(projectId)
    setConfig(cfg)

    // Get initial state only once
    const cookieHeader = document.cookie
    const state = cookieToInitialState(cfg, cookieHeader)
    setInitialState(state)

    initializedRef.current = true
  }, [projectId])

  useEffect(() => {
    let cancelled = false
    const initializeSignerAndAccount = async () => {
      try {
        if (!signer) {
          const signerParams: TariL1SignerParameters = {
            name: 'TariL1Signer',
            onConnection: setTariAccount,
          }
          const newSigner = new TariL1Signer(signerParams)
          if (!cancelled) setSigner(newSigner)
        }
        if (!cancelled) {
          await setAppConfig()
          await setTariAccount()
          getInitConfig()
        }
      } catch (error) {
        console.error('[ TAPPLET-BRIDGE ] Failed to set Tari Account:', error)
      }
    }
    initializeSignerAndAccount()
    return () => {
      cancelled = true
    }
  }, [setAppConfig, setSigner, setTariAccount, signer])

  useIframeMessage((event) => {
    switch (event.data.type) {
      case MessageType.SET_FEATURES:
        const unwrapEnabled = event.data.payload.unwrapEnabled
        setUnwrapEnabled(unwrapEnabled)
        break
      case MessageType.SET_THEME:
        const theme = event.data.payload.theme
        setTheme(theme)
        break
      case MessageType.SET_LANGUAGE:
        const language = event.data.payload.language
        setLanguage(language)
        break
    }
  })

  if (!config) {
    return <div className="h-5 w-5 animate-spin rounded-full border-b-[3px] border-white"></div>
  }

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
