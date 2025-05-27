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
