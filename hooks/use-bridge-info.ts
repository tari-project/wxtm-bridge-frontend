import { useMemo } from 'react'
import { Network } from '@/components/network-box'

export const useBridgeInfo = (
  fromNetwork: Network,
  ethereumAddress: string,
  tariWalletAddress: string,
  handleBridgeToEthereum?: () => void,
  handleBridgeToTari?: () => void,
) => {
  return useMemo(() => {
    const isFromTari = fromNetwork.name === 'Tari'

    const fromToken = isFromTari ? 'XTM' : 'wXTM'
    const toToken = isFromTari ? 'wXTM' : 'XTM'
    const destAddress = isFromTari ? ethereumAddress : tariWalletAddress
    const bridgeHandler = isFromTari
      ? handleBridgeToEthereum
      : handleBridgeToTari

    return { fromToken, toToken, destAddress, bridgeHandler }
  }, [
    fromNetwork.name,
    ethereumAddress,
    tariWalletAddress,
    handleBridgeToEthereum,
    handleBridgeToTari,
  ])
}
