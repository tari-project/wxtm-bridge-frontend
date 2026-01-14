import useAppStore from '@/store/app'
import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { mainnet, baseSepolia, sepolia } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

export function getConfig(id?: string) {
  const projectId = id || useAppStore.getState().walletConnectProjectId
  return createConfig({
    chains: [mainnet, baseSepolia, sepolia],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [baseSepolia.id]: http(),
    },
    connectors: [
      walletConnect({
        projectId: projectId,
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
  })
}
