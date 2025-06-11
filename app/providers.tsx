'use client'

import { ReactNode, useState, useEffect } from 'react'
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
  const [configChecked, setConfigChecked] = useState(false)
  const setTariAccount = useTariAccountStore((s) => s.setTariAccount)
  const setAppConfig = useAppStore((s) => s.setAppConfig)
  const setTheme = useAppStore((s) => s.setTheme)
  const signer = useTariSignerStore((s) => s.signer)
  const setSigner = useTariSignerStore((s) => s.setSigner)
  const projectId = useAppStore((s) => s.walletConnectProjectId)
  console.warn(
    '[ TAPPLET-BRIDGE ] init state',
    typeof initialState,
    initialState,
  )

  // 1. On mount, ask parent for config (REOWN_WALLETCONNECT_CONFIG)
  useEffect(() => {
    if (!configChecked) {
      console.warn('[ TAPPLET-BRIDGE ] ask for config', initialState)
      window.parent.postMessage({ type: 'REQUEST_WALLETCONNECT_CONFIG' }, '*')
      setConfigChecked(true)
    }
  }, [configChecked, initialState])

  // 2. Listen for config from parent, or create new config if not present
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'WALLETCONNECT_CONFIG_DATA') {
        const parentConfig = event.data.payload.config
        if (
          !parentConfig ||
          parentConfig === 'null' ||
          parentConfig === 'undefined' ||
          parentConfig === ''
        ) {
          // No config from parent, create new config
          const cfg = getConfig(projectId)
          setConfig(cfg)
          setInitialState(undefined)
          console.info(
            '[ TAPPLET-BRIDGE ] No config from parent, created new config:',
            cfg,
          )
        } else {
          // Config exists from parent, parse and use it
          try {
            console.info(
              '[ TAPPLET-BRIDGE ] Using config from parent:',
              typeof parentConfig === 'string',
              parentConfig,
            )
            try {
              const parsedState: State =
                typeof parentConfig === 'string'
                  ? JSON.parse(parentConfig)
                  : parentConfig
              // Revive connections into a Map
              if (
                parsedState.connections &&
                !(parsedState.connections instanceof Map)
              ) {
                parsedState.connections = new Map(parsedState.connections)
              }
              setInitialState(parsedState)
              console.info('[ TAPPLET-BRIDGE ] parsed state:', parsedState)
              // setConfig(parsedState)
            } catch (error) {
              console.error(
                '[ TAPPLET-BRIDGE ] Failed to set init state:',
                error,
              )
            }
            // If parent also sent session state, set it here
            // if (event.data.session) {
            //   setInitialState(event.data.session)
            // }
          } catch (error) {
            console.error(
              '[ TAPPLET-BRIDGE ] Failed to parse parent config:',
              error,
            )
            // fallback: create new config
            const cfg = getConfig(projectId)
            setConfig(cfg)
            setInitialState(undefined)
          }
        }
        // If configData is present, set initial state
        const configData: string = event.data.payload?.config || ''
        if (projectId && configData) {
          try {
            const parsedState = JSON.parse(configData) as State
            setInitialState(parsedState)
          } catch (error) {
            console.error(
              '[ TAPPLET-BRIDGE ] Failed to parse configData:',
              error,
            )
          }
        }
      } else if (event.data?.type === 'SET_THEME') {
        setTheme(event.data.payload)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [projectId, setTheme, config])

  // If no config event is sent after a short delay, create a new config
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null
    if (!config && projectId) {
      timeout = setTimeout(() => {
        if (!config) {
          const cfg = getConfig(projectId)
          setConfig(cfg)
          // setInitialState(undefined)
          console.info(
            '[ TAPPLET-BRIDGE ] No config event received, created new config:',
            cfg,
          )
        }
      }, 1000) // 1 second timeout, adjust as needed
    }
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [config, projectId])

  // 3. When connected, send session data to parent for storage
  // const sendSessionToParent = useCallback((state: State | undefined) => {
  //   if (!state) return
  //   try {
  //     window.parent.postMessage(
  //       {
  //         type: 'REOWN_WALLETCONNECT_SESSION',
  //         payload: state,
  //       },
  //       '*',
  //     )
  //   } catch (error) {
  //     console.error(
  //       '[Providers] Failed to send session data to parent iframe:',
  //       error,
  //     )
  //   }
  // }, [])

  // const sendConfigToParent = useCallback((state: string) => {
  //   if (!state) return
  //   try {
  //     window.parent.postMessage(
  //       {
  //         type: 'REOWN_WALLETCONNECT_CONFIG',
  //         payload: state,
  //       },
  //       '*',
  //     )
  //   } catch (error) {
  //     console.error(
  //       '[Providers] Failed to send session data to parent iframe:',
  //       error,
  //     )
  //   }
  // }, [])

  // 4. Watch for connection and send session to parent
  // useEffect(() => {
  //   if (initialState) {
  //     sendSessionToParent(initialState)
  //   }
  //   if (config) {
  //     // Only serialize the state property
  //     const serializableState = config.state

  //     // Custom replacer to handle Maps/Sets in state
  //     const replacer = (_key: string, value: any) => {
  //       if (typeof value === 'function' || typeof value === 'symbol') {
  //         return undefined
  //       }
  //       if (value instanceof Map) {
  //         return Array.from(value.entries())
  //       }
  //       if (value instanceof Set) {
  //         return Array.from(value)
  //       }
  //       return value
  //     }

  //     try {
  //       const serializedState = JSON.stringify(serializableState, replacer)
  //       console.log('serialized provider state', serializedState)
  //       // sendConfigToParent(serializedState)
  //     } catch (error) {
  //       console.error('[Providers] Failed to serialize state:', error)
  //     }
  //   }
  // }, [config, initialState, sendConfigToParent, sendSessionToParent])

  // 5. Auto-connect and set config and initial state if not restoring from parent
  // useEffect(() => {
  //   if (projectId && !sessionRestored) {
  //     const cfg = getConfig(projectId)
  //     setConfig(cfg)
  //     console.warn('[ TAPPLET-BRIDGE ] 5. SET CONFIG', cfg.state.current)
  //     console.warn('[ TAPPLET-BRIDGE ] 5. SET CONFIG', cfg.storage?.key)
  //     ;(async () => {
  //       const item = await cfg.storage?.getItem(cfg.storage?.key)
  //       console.warn('[ TAPPLET-BRIDGE ] 5. SET CONFIG item', item)
  //     })()
  //     // No cookies in iframe, so don't use document.cookie
  //     // Let Wagmi start with empty state, or wait for parent session
  //     setInitialState(undefined)
  //   }
  // }, [projectId, sessionRestored])

  // 6. Initialize signer and account on mount (unchanged)
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
        console.info('[ TAPPLET-BRIDGE ] set app config')
        await setAppConfig()
      } catch (error) {
        console.error('[ TAPPLET-BRIDGE ] Failed to set Tari Account:', error)
      }
    }
    initializeSignerAndAccount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSigner, setTariAccount, signer])

  // 7. Existing iframe message handler (unchanged)
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
      case MessageType.SET_THEME:
        console.info(
          '[ TAPPLET-BRIDGE ] Received SET_THEME message from parent window',
        )
        break
    }
  })

  if (!config)
    return (
      <div className="h-5 w-5 animate-spin rounded-full border-b-[3px] border-white"></div>
    )

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
