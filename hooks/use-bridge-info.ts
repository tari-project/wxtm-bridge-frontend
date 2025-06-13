import { useMemo } from 'react'
import { Network } from '@/components/network-box'

export type BridgeInfo = {
  fromToken: string
  toToken: string
  isWrapping: boolean
  destAddress?: string
  bridgeHandler?: () => void
}

export const useBridgeInfo = (
  fromNetwork: Network,
  ethereumAddress?: string,
  tariWalletAddress?: string,
  handleBridgeToEthereum?: () => void,
  handleBridgeToTari?: () => void,
): BridgeInfo => {
  return useMemo(() => {
    const isWrapping = fromNetwork.name === 'Tari'

    const fromToken = isWrapping ? 'XTM' : 'wXTM'
    const toToken = isWrapping ? 'wXTM' : 'XTM'
    const destAddress = isWrapping ? ethereumAddress : tariWalletAddress
    const bridgeHandler = isWrapping
      ? handleBridgeToEthereum
      : handleBridgeToTari

    return { fromToken, toToken, isWrapping, destAddress, bridgeHandler }
  }, [
    fromNetwork.name,
    ethereumAddress,
    tariWalletAddress,
    handleBridgeToEthereum,
    handleBridgeToTari,
  ])
}
