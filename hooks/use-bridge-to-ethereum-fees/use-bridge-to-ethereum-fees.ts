import { useMemo } from 'react'
import { parseUnits, formatUnits } from 'ethers'

import { config } from '@/config'
import { BridgeToEthereumFees } from './use-bridge-to-ethereum-fees.types'

export const useBridgeToEthereumFees = (
  tokenAmount: string,
): BridgeToEthereumFees => {
  return useMemo(() => {
    try {
      if (!tokenAmount || tokenAmount.trim() === '') {
        return {
          feeAmount: '0',
          amountAfterFee: '0',
          feePercentage: 0,
          isOverHighBridgeThreshold: false,
        }
      }
      const amount = parseUnits(tokenAmount, 6)
      const parsedThreshold = parseUnits(
        config.HIGH_BRIDGE_THRESHOLD.toString(),
        6,
      )
      const isOverHighBridgeThreshold = amount > parsedThreshold

      const feeAmountBN =
        (amount * BigInt(config.FEE_PERCENTAGE_BPS)) / BigInt(10000)
      const amountAfterFeeBN = amount - feeAmountBN

      return {
        feeAmount: formatUnits(feeAmountBN, 6).toString(),
        amountAfterFee: formatUnits(amountAfterFeeBN, 6).toString(),
        feePercentage: config.FEE_PERCENTAGE_BPS / 100,
        isOverHighBridgeThreshold,
      }
    } catch (error) {
      console.error('Could not estimate ETH fees: ', error)

      return {
        feeAmount: '0',
        amountAfterFee: '0',
        feePercentage: 0,
        isOverHighBridgeThreshold: false,
      }
    }
  }, [tokenAmount])
}
