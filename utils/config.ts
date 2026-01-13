import { walletConnect } from 'wagmi/connectors'
import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { mainnet, baseSepolia, sepolia } from 'wagmi/chains'
import useAppStore from '@/store/app'

export function getConfig(id?: string) {
  const projectId = id || useAppStore.getState().walletConnectProjectId
  const wcConnector = walletConnect({
    projectId,
    customStoragePrefix: 'wagmi-wc',
  })
  return createConfig({
    chains: [mainnet, baseSepolia, sepolia],
    connectors: [wcConnector],
    multiInjectedProviderDiscovery: false,
    storage: createStorage({ key: 'tari-bridge', storage: cookieStorage }),
    ssr: true,
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [baseSepolia.id]: http(),
    },
  })
}
