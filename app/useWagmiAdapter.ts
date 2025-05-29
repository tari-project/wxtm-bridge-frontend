// import { createAppKit } from '@reown/appkit/react';
import { AppKitNetwork, mainnet, sepolia } from '@reown/appkit/networks'
// import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
// import { ConfigBackendInMemory } from '@app/types/configs';
// import { useConfigBEInMemoryStore } from '@app/store';
// import { invoke } from '@tauri-apps/api/core';
import useTariAccount from '@/store/account'
import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { useEffect, useState } from 'react'

const metadata = {
  name: 'Tari Universe',
  description: 'Tari Universe Wallet',
  url: 'https://tari.com',
  icons: ['https://universe.tari.com/assets/tari-logo.png'],
}

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, sepolia]

const baseAdapterConfig = {
  networks,
  ssr: false,
}

export const useWagmiAdapter = () => {
  const projectId = useTariAccount.getState().walletconnect_id
  //   const [projectId, setProjectId] = useState<string | undefined>(undefined)
  const [initializedAdapter, setInitializedAdapter] = useState<
    WagmiAdapter | undefined
  >(undefined)
  const [isInitializing, setIsInitializing] = useState<boolean>(false)

  //   const debouncedRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (projectId && !isInitializing && !initializedAdapter) {
      setIsInitializing(true)
      const wagmiAdapterInstance = new WagmiAdapter({
        ...baseAdapterConfig,
        projectId,
      })

      createAppKit({
        adapters: [wagmiAdapterInstance],
        networks,
        projectId,
        metadata,
      })
      setInitializedAdapter(wagmiAdapterInstance)
      setIsInitializing(false)
    } else if (projectId === '' && !isInitializing && !initializedAdapter) {
      setIsInitializing(false)
    }
  }, [projectId, initializedAdapter, isInitializing]) // Dependencies for this effect

  return initializedAdapter
}
