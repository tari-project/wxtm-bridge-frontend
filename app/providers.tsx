'use client'

import { ReactNode, useState, useEffect, useRef } from 'react'
import { WagmiProvider, State, Config } from 'wagmi'
import { getConfig } from '@/utils/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useTariAccountStore from '@/store/account'
import useTariSignerStore from '@/store/signer'
import { TariL1SignerParameters } from '@/types/tapplet'
import TariL1Signer from '@/clients/tari-l1-signer'
import useAppStore from '@/store/app'
import { MessageType, useIframeMessage } from '@/utils/useIframeMessage'

export const Providers = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<Config | null>(null)
  const [queryClient] = useState(() => new QueryClient())
  const [initialState, setInitialState] = useState<State | undefined>(undefined)
  const [waitingForParent, setWaitingForParent] = useState(true)
  const configSetRef = useRef(false)
  const setTariAccount = useTariAccountStore((s) => s.setTariAccount)
  const setAppConfig = useAppStore((s) => s.setAppConfig)
  const signer = useTariSignerStore((s) => s.signer)
  const setSigner = useTariSignerStore((s) => s.setSigner)
  const projectId = useAppStore((s) => s.walletConnectProjectId)
  const setTheme = useAppStore((s) => s.setTheme)

  // 1. On mount, always post REQUEST_WALLETCONNECT_CONFIG to parent
  // useEffect(() => {
  //   window.parent.postMessage({ type: 'REQUEST_WALLETCONNECT_CONFIG' }, '*')
  // }, [])

  // 2. Listen for WALLETCONNECT_CONFIG_DATA from parent and set config/initialState ONCE
  // useEffect(() => {
  //   const handleMessage = (event: MessageEvent) => {
  //     if (configSetRef.current) return

  //     if (event.data?.type === MessageType.WALLETCONNECT_CONFIG_DATA) {
  //       const parentConfig = event.data.payload.config

  //       if (
  //         !parentConfig ||
  //         parentConfig === 'null' ||
  //         parentConfig === 'undefined' ||
  //         parentConfig === ''
  //       ) {
  //         // No config from parent, create new config ONCE
  //         const cfg = getConfig(projectId)
  //         setConfig(cfg)
  //         configSetRef.current = true
  //         setWaitingForParent(false)
  //         console.info(
  //           '[ TAPPLET-BRIDGE ] No config from parent, created new config:',
  //           cfg,
  //         )
  //       } else {
  //         // Config exists from parent, parse and use it as initial state, create config ONCE
  //         try {
  //           const parsedState: State =
  //             typeof parentConfig === 'string'
  //               ? JSON.parse(parentConfig)
  //               : parentConfig
  //           if (
  //             parsedState.connections &&
  //             !(parsedState.connections instanceof Map)
  //           ) {
  //             parsedState.connections = new Map(parsedState.connections)
  //           }
  //           setInitialState(parsedState)
  //           const cfg = getConfig(projectId)
  //           setConfig(cfg)
  //           configSetRef.current = true
  //           setWaitingForParent(false)
  //           console.info(
  //             '[ TAPPLET-BRIDGE ] Using config from parent, parsed state:',
  //             parsedState,
  //           )
  //         } catch (error) {
  //           console.error('[ TAPPLET-BRIDGE ] Failed to set init state:', error)
  //           // fallback: create new config ONCE
  //           // const cfg = getConfig(projectId)
  //           // setConfig(cfg)
  //           // setInitialState(undefined)
  //           // configSetRef.current = true
  //           // setWaitingForParent(false)
  //         }
  //       }
  //     }
  //   }

  //   window.addEventListener('message', handleMessage)
  //   return () => window.removeEventListener('message', handleMessage)
  // }, [projectId])

  // 3. Initialize signer and account on mount (unchanged)
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
        await setAppConfig()
      } catch (error) {
        console.error('[ TAPPLET-BRIDGE ] Failed to set Tari Account:', error)
      }
    }
    initializeSignerAndAccount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSigner, setTariAccount, signer])

  useIframeMessage((event) => {
    switch (event.data.type) {
      case MessageType.SIGNER_CALL:
        console.info(
          '[ TAPPLET-BRIDGE ] Received SIGNER_CALL message from parent window',
        )
        break
      case MessageType.RESIZE:
        console.info(
          '[ TAPPLET-BRIDGE ] Received RESIZE message from parent window',
        )
        break
      case MessageType.SET_THEME: {
        console.info(
          '[ TAPPLET-BRIDGE ] Received SET_THEME message from parent window',
        )
        setTheme(event.data.payload)
        break
      }
      case MessageType.WALLETCONNECT_CONFIG_DATA: {
        const parentConfig = event.data.payload.config
        console.error('[ TAPPLET-BRIDGE ] DUUUUUUUUPAAAAAAA:', parentConfig)

        if (
          !parentConfig ||
          parentConfig === 'null' ||
          parentConfig === 'undefined' ||
          parentConfig === ''
        ) {
          // No config from parent, create new config ONCE
          const cfg = getConfig(projectId)
          setConfig(cfg)
          configSetRef.current = true
          setWaitingForParent(false)
          console.info(
            '[ TAPPLET-BRIDGE ] No config from parent, created new config:',
            cfg,
          )
        } else {
          // Config exists from parent, parse and use it as initial state, create config ONCE
          try {
            const parsedState: State =
              typeof parentConfig === 'string'
                ? JSON.parse(parentConfig)
                : parentConfig
            if (
              parsedState.connections &&
              !(parsedState.connections instanceof Map)
            ) {
              parsedState.connections = new Map(parsedState.connections)
            }
            setInitialState(parsedState)
            const cfg = getConfig(projectId)
            setConfig(cfg)
            configSetRef.current = true
            setWaitingForParent(false)
            console.info(
              '[ TAPPLET-BRIDGE ] Using config from parent, parsed state:',
              parsedState,
            )
          } catch (error) {
            console.error('[ TAPPLET-BRIDGE ] Failed to set init state:', error)
          }
        }
      }
    }
  })

  if (waitingForParent || !config || !initialState) {
    console.info(
      '[ TAPPLET-BRIDGE ] waiting for parent or no config',
      waitingForParent,
      config,
    )
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
