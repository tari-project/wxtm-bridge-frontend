import useAppStore from '@/store/app'
import { http, createConfig } from 'wagmi'
import { mainnet, baseSepolia, sepolia } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

declare global {
  // Avoid TS error on `globalThis` and multiple WalletConnect reload

  var wagmiConfig: ReturnType<typeof createConfig> | undefined
}

export function getConfig(id?: string) {
  const projectId = id || useAppStore.getState().walletConnectProjectId
  if (!globalThis.wagmiConfig) {
    globalThis.wagmiConfig = createConfig({
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
      ssr: true,
    })
  }

  return globalThis.wagmiConfig
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof createConfig>
  }
}
