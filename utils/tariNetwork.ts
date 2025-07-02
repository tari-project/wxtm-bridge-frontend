import useAppStore from '@/store/app'

export function getEtherscanBaseUrl(): string {
  const bridgeAPI = useAppStore.getState().bridgeAPI

  const isTestnet = bridgeAPI.toLowerCase().includes('staging')

  return isTestnet ? 'https://sepolia.etherscan.io' : 'https://etherscan.io'
}

export function buildEtherscanLink(transactionHash?: string): string {
  const baseUrl = getEtherscanBaseUrl()

  if (transactionHash) {
    return `${baseUrl}/tx/${transactionHash}`
  }

  return `https://etherscan.io/address/0xfD36fA88bb3feA8D1264fc89d70723b6a2B56958`
}
