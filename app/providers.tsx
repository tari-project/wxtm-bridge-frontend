'use client'

import { ReactNode, useState, useEffect, useRef, useCallback, useEffectEvent } from 'react'
import { WagmiProvider, State, Config, cookieToInitialState } from 'wagmi'
import { getConfig } from '@/utils/config'
import { QueryClientProvider } from '@tanstack/react-query'
import { setTariAccount } from '@/store/account'
import { TariL1SignerParameters } from '@/types/tapplet'
import TariL1Signer from '@/clients/tari-l1-signer'
import { IframeMessage, MessageType, useIframeMessage } from '@/utils/useIframeMessage'
import useAppStore, { setAppConfig, setLanguage, setTheme } from '@/store/app'
import useTariSignerStore, { setSigner } from '@/store/signer'
import { getInitConfig } from '@/utils/universe'
import { queryClient } from '@/app/queryClient'

export const Providers = ({ children }: { children: ReactNode }) => {
  const projectId = useAppStore((s) => s.walletConnectProjectId)
  const signer = useTariSignerStore((s) => s.signer)
  const [config, setConfig] = useState<Config | null>(null)
  const [initialState, setInitialState] = useState<State | undefined>(undefined)
  const initializedRef = useRef(false)

  const onInitialized = useEffectEvent((cfg: Config, state?: State) => {
    setConfig(cfg)
    if (state) {
      setInitialState(state)
    }
  })

  useEffect(() => {
    if (!projectId || initializedRef.current) return
    const cfg = getConfig(projectId)

    // Get initial state only once
    const cookieHeader = document.cookie
    const state = cookieToInitialState(cfg, cookieHeader)

    onInitialized(cfg, state)
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
    void initializeSignerAndAccount()
    return () => {
      cancelled = true
    }
  }, [signer])

  const handleMessage = useCallback((event: MessageEvent<IframeMessage>) => {
    switch (event.data.type) {
      case MessageType.SET_THEME:
        const theme = event?.data?.payload?.theme
        setTheme(theme)
        break
      case MessageType.SET_LANGUAGE:
        const language = event?.data?.payload?.language
        void setLanguage(language)
        break
    }
  }, [])

  useIframeMessage(handleMessage)

  if (!config) {
    return <div className="h-5 w-5 animate-spin rounded-full border-b-[3px] border-white" />
  }

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
