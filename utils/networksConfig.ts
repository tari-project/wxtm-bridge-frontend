export const supportedChains = [
  {
    id: 1,
    name: 'ETH MAINNET',
    icon: '/eth.png',
  },
  {
    id: 11155111,
    name: 'SEPOLIA',
    icon: '/eth.png',
  },
  {
    id: 84532,
    name: 'BASE SEPOLIA',
    icon: '/eth.png',
  },
]

const supportedChainIds = new Set(supportedChains.map((chain) => chain.id))

export const chainsMap: Record<number, string> = {
  1: 'ETH MAINNET',
  11155111: 'SEPOLIA',
  84532: 'BASE SEPOLIA',
}

export const isChainSupported = (chainId?: number): boolean => {
  if (chainId === undefined) return false
  return supportedChainIds.has(chainId)
}

export const networks = [
  { name: 'Ethereum', icon: '/icons/eth.png' },
  { name: 'Solana', icon: '/icons/sol.png' },
  { name: 'Tari', icon: '/icons/tari.png' },
]
