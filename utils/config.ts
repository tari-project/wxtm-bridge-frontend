import useAppStore from '@/store/app'
import { fallback, http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { mainnet, baseSepolia, sepolia } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

const defaultMainnetRpcUrls = [
  'https://ethereum-rpc.publicnode.com',
  'https://eth-mainnet.public.blastapi.io',
  'https://eth.drpc.org',
]

const configuredMainnetRpcUrls = process.env.NEXT_PUBLIC_ETHEREUM_MAINNET_RPC_URLS?.split(',')
  .map((url) => url.trim())
  .filter(Boolean)

const mainnetRpcUrls = configuredMainnetRpcUrls?.length ? configuredMainnetRpcUrls : defaultMainnetRpcUrls

const mainnetTransports = fallback(mainnetRpcUrls.map((url) => http(url)))

export function getConfig(id?: string) {
  const projectId = id || useAppStore.getState().walletConnectProjectId
  return createConfig({
    chains: [mainnet, baseSepolia, sepolia],
    transports: {
      [mainnet.id]: mainnetTransports,
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
