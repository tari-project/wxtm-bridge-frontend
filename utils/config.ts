import useAppStore from '@/store/app'
import { createConfig, createStorage, cookieStorage, fallback, http } from 'wagmi'
import { mainnet, baseSepolia, sepolia } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

export function getConfig(id?: string) {
  const { walletConnectProjectId, ethereumNodes } = useAppStore.getState()
  const projectId = id || walletConnectProjectId

  const urlsByChain = new Map(ethereumNodes.map((node) => [node.chainId, node.urls]))

  // Prefer the backend-served public RPC nodes; fall back to viem's defaults
  // when the backend has no nodes for a chain (or the list could not be fetched).
  const transportFor = (chainId: number) => {
    const urls = urlsByChain.get(chainId)
    return urls?.length ? fallback(urls.map((url) => http(url))) : http()
  }

  return createConfig({
    chains: [mainnet, baseSepolia, sepolia],
    transports: {
      [mainnet.id]: transportFor(mainnet.id),
      [sepolia.id]: transportFor(sepolia.id),
      [baseSepolia.id]: transportFor(baseSepolia.id),
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
