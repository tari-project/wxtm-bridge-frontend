import { walletConnect } from 'wagmi/connectors'
import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { mainnet, baseSepolia, sepolia } from 'wagmi/chains'
import useAppStore from '@/store/app'

export function getConfig(id?: string) {
  const projectId = id || useAppStore.getState().walletConnectProjectId
  if (!projectId.length) return
  const config = createConfig({
    chains: [mainnet, baseSepolia, sepolia],
    connectors: [walletConnect({ projectId })],
    storage: createStorage({ storage: cookieStorage }),
    ssr: true,
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [baseSepolia.id]: http(),
    },
  })
  if (config) {
    return config
  }
}
