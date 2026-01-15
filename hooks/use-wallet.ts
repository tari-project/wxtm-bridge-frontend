import { useWalletClient } from 'wagmi'

export const useWalletUtils = () => {
  const { data: walletClient } = useWalletClient()
  const addXtmToWalletAction = async () => {
    try {
      return walletClient?.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: '0xfD36fA88bb3feA8D1264fc89d70723b6a2B56958',
            symbol: 'wXTM',
            decimals: 18,
            image: 'https://tari.com/favicon.png?v=1',
          },
        },
      })
    } catch (error) {
      console.error('Failed to ask wallet to watch asset:', error)
      return false
    }
  }

  return {
    addXtmToWalletAction,
  }
}
