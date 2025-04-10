import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { baseSepolia, sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

export function getConfig() {
  return createConfig({
    chains: [baseSepolia, sepolia],
    transports: {
      [baseSepolia.id]: http(),
      [sepolia.id]: http(),
    },
    connectors: [
      injected(),
      coinbaseWallet(),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? '',
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
  })
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof createConfig>
  }
}
