'use client'

import { ReactNode, useState, useEffect } from 'react'
import { WagmiProvider, State } from 'wagmi'
import { getConfig } from '@/utils/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cookieToInitialState } from 'wagmi'

export const Providers = ({ children }: { children: ReactNode }) => {
  const [config] = useState(() => getConfig())
  const [queryClient] = useState(() => new QueryClient())
  const [initialState, setInitialState] = useState<State | undefined>(undefined)

  useEffect(() => {
    const cookieHeader = document.cookie
    const state = cookieToInitialState(config, cookieHeader)
    setInitialState(state)
  }, [config])

  if (!initialState)
    console.error('[ Bridge ] provider initial state undefined')

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
