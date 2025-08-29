import { useMemo } from 'react'
import { utils } from 'ethers'

import { config } from '@/config'
import { BridgeToEthereumFees } from './use-bridge-to-ethereum-fees.types'
import useBridgeStore from '@/store/bridge'

export const useBridgeToEthereumFees = (
  tokenAmount: string,
): BridgeToEthereumFees => {
  const wrapTokenFeePercentageBps = useBridgeStore(
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
      const amount = utils.parseUnits(tokenAmount, 6)
      const parsedThreshold = utils.parseUnits(
        config.HIGH_BRIDGE_THRESHOLD.toString(),
        6,
      )
      const isOverHighBridgeThreshold = amount > parsedThreshold

      const feeAmountBN = amount.mul(wrapTokenFeePercentageBps).div(10000)
      const amountAfterFeeBN = amount.sub(feeAmountBN)

      return {
        feeAmount: utils.formatUnits(feeAmountBN, 6).toString(),
        amountAfterFee: utils.formatUnits(amountAfterFeeBN, 6).toString(),
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
