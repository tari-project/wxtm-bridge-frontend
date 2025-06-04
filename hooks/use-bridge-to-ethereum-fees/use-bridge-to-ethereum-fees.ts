import { useMemo } from 'react'
import { parseUnits, formatUnits } from 'ethers'

import { config } from '@/config'
import { BridgeToEthereumFees } from './use-bridge-to-ethereum-fees.types'
import useTariAccount from '@/store/account'

export const useBridgeToEthereumFees = (
  tokenAmount: string,
): BridgeToEthereumFees => {
  const wrapTokenFeePercentageBps = useTariAccount(
    (s) => s.wrapTokenFeePercentageBps,
  )

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
        (amount * BigInt(wrapTokenFeePercentageBps)) / BigInt(10000)
      const amountAfterFeeBN = amount - feeAmountBN

      return {
        feeAmount: formatUnits(feeAmountBN, 6).toString(),
        amountAfterFee: formatUnits(amountAfterFeeBN, 6).toString(),
        feePercentage: wrapTokenFeePercentageBps / 100,
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
  }, [tokenAmount, wrapTokenFeePercentageBps])
}
