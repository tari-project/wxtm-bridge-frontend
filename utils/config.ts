import useAppStore from '@/store/app'
import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { mainnet, baseSepolia, sepolia } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

declare global {
  // Avoid TS error on `globalThis` and multiple WalletConnect reload
  // eslint-disable-next-line no-var
  var wagmiConfig: ReturnType<typeof createConfig> | undefined
}

export function getConfig(id?: string) {
  const project_id = id || useAppStore.getState().walletConnectProjectId
  console.info('[ TAPPLET-BRIDGE ][ CONFIG ] wagmi config create', project_id)
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
          projectId: project_id ?? '',
        }),
      ],
      storage: createStorage({
        storage: cookieStorage,
      }),
      ssr: true,
    })
  }

  console.info(
    '[ TAPPLET-BRIDGE ][ CONFIG ] wagmi config',
    globalThis.wagmiConfig,
  )
  return globalThis.wagmiConfig
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof createConfig>
  }
}
