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

export const Providers = ({ children }: { children: ReactNode }) => {
  const projectId = useTariAccount((s) => s.walletconnect_id)
  const [config, setConfig] = useState<Config | null>(null)
  const [queryClient] = useState(() => new QueryClient())
  const [initialState, setInitialState] = useState<State | undefined>(undefined)
  const { setTariAccount } = useTariAccount()
  const { signer, setSigner } = useTariSigner()

  useEffect(() => {
    console.log('[ TAPPLET-BRIDGE ] projectId', projectId)
    if (projectId) {
      console.log('[ TAPPLET-BRIDGE ] projectId set config', projectId)
      setConfig(getConfig())
    }
  }, [projectId])

  useEffect(() => {
    console.log('[ TAPPLET-BRIDGE ] id & config', projectId, config)
    if (projectId && config) {
      const cookieHeader = document.cookie
      console.log('[ TAPPLET-BRIDGE ] set cookie header', cookieHeader)
      const state = cookieToInitialState(config, cookieHeader)
      console.log('[ TAPPLET-BRIDGE ] set initial state', state)
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
        const config = await signer?.getAppWalletSession()
        const wagmiConfig = getConfig(id)
        setConfig(getConfig(id))
        console.log('[ TAPPLET-BRIDGE ] tari account id', id)
        console.error('[ TAPPLET-BRIDGE ][INIT CONFIG]', config)
        console.error('[ TAPPLET-BRIDGE ][INIT CONFIG]', wagmiConfig)
      } catch (error) {
        console.error('[ TAPPLET-BRIDGE ] Failed to set Tari Account:', error)
      }
    }

    initializeSignerAndAccount()
  }, [setSigner, setTariAccount, signer])

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
        <h1>Bridge initialization in progress</h1>
      )}
    </>
  )
}
