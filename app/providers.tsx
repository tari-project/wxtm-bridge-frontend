'use client'

import { ReactNode, useEffect, useEffectEvent, useRef, useState } from 'react'
import { Config, cookieToInitialState, State, WagmiProvider } from 'wagmi'
import { getConfig } from '@/utils/config'
import { QueryClientProvider } from '@tanstack/react-query'
import { setTariAccount } from '@/store/account'
import { TariL1SignerParameters } from '@/types/tapplet'
import TariL1Signer from '@/clients/tari-l1-signer'
import { IframeMessage, MessageType } from '@/utils/useIframeMessage'
import useAppStore, { setAppConfig, setLanguage, setTheme } from '@/store/app'
import useTariSignerStore, { setSigner } from '@/store/signer'
import { getInitConfig } from '@/utils/universe'
import { queryClient } from './queryClient'

export const Providers = ({ children }: { children: ReactNode }) => {
  const walletConnectProjectId = useAppStore((s) => s.walletConnectProjectId)
  const signer = useTariSignerStore((s) => s.signer)
  const [config, setConfig] = useState<Config | null>(null)
  const [initialState, setInitialState] = useState<State | undefined>()
  const configRef = useRef<Config | null>(null)
  const stateRef = useRef<State | undefined>(undefined)

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
          if (!cancelled) {
            setSigner(newSigner)
          }
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

  const onMessage = useEffectEvent((event: MessageEvent<string>) => {
    const parsedData: IframeMessage = JSON.parse(event.data)
    switch (parsedData.type) {
      case MessageType.SET_THEME:
        const theme = parsedData?.payload?.theme
        setTheme(theme)
        break
      case MessageType.SET_LANGUAGE:
        const language = parsedData?.payload?.language
        void setLanguage(language)
        break
    }
  })

  useEffect(() => {
    // listen for messages from the parent window
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const onInitialized = useEffectEvent(() => {
    setConfig(configRef.current)
    setInitialState(stateRef.current)
  })

  useEffect(() => {
    if (!walletConnectProjectId || configRef.current) return
    configRef.current = getConfig(walletConnectProjectId)

    // Get initial state only once
    const cookieHeader = document.cookie
    const state = cookieToInitialState(configRef.current, cookieHeader)

    if (state) {
      stateRef.current = state
    }
    onInitialized()
  }, [walletConnectProjectId])

  if (!config) {
    return <div className="h-5 w-5 animate-spin rounded-full border-b-[3px] border-white"></div>
  }

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
