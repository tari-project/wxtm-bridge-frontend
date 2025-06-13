'use client'

import { ReactNode, useState, useEffect } from 'react'
import { WagmiProvider, State, Config } from 'wagmi'
import { getConfig } from '@/utils/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cookieToInitialState } from 'wagmi'
import useTariAccount from '@/store/account'
import useTariSigner from '@/store/signer'
import { TariL1SignerParameters } from '@/types/tapplet'
import TariL1Signer from '@/clients/tari-l1-signer'
import { MessageType, useIframeMessage } from '@/utils/useIframeMessage'

export const Providers = ({ children }: { children: ReactNode }) => {
  const projectId = useTariAccount((s) => s.walletconnect_id)
  const [config, setConfig] = useState<Config | null>(null)
  const [queryClient] = useState(() => new QueryClient())
  const [initialState, setInitialState] = useState<State | undefined>(undefined)
  const { setTariAccount } = useTariAccount()
  const setLanguage = useTariAccount((s) => s.setLanguage)
  const { signer, setSigner } = useTariSigner()

  useEffect(() => {
    if (projectId) {
      setConfig(getConfig())
    }
  }, [projectId])

  useEffect(() => {
    if (projectId && config) {
      const cookieHeader = document.cookie
      const state = cookieToInitialState(config, cookieHeader)
      setInitialState(state)
    }
  }, [config, projectId])

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

        const id = await setTariAccount()
        setConfig(getConfig(id))
      } catch (error) {
        console.error('[ TAPPLET-BRIDGE ] Failed to set Tari Account:', error)
      }
    }

    initializeSignerAndAccount()
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
      case MessageType.SET_LANGUAGE:
        const language = event.data.payload.language
        console.info('[ TAPPLET-BRIDGE ] Received SET_LANGUAGE: ', language)
        setLanguage(language)
        break
    }
  })
  if (!initialState)
    console.debug('[ TAPPLET-BRIDGE ] provider initial state undefined')

  return (
    <>
      {projectId.length ? (
        <WagmiProvider config={getConfig()} initialState={initialState}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      ) : (
        <h1>...</h1>
      )}
    </>
  )
}
