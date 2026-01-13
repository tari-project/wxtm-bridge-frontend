import { useMemo } from 'react'
import { utils } from 'ethers'

import { config } from '@/config'
import { BridgeFees } from './use-bridge-fees.types'
import useBridgeStore from '@/store/bridge'

export const useBridgeFees = (tokenAmount: string, tokenDecimals: number): BridgeFees => {
  const wrapTokenFeePercentageBps = useBridgeStore((s) => s.wrapTokenFeePercentageBps)

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
      const amount = utils.parseUnits(tokenAmount, tokenDecimals)
      const parsedThreshold = utils.parseUnits(config.HIGH_BRIDGE_THRESHOLD.toString(), tokenDecimals)

      const isOverHighBridgeThreshold = amount.gt(parsedThreshold)

      const feeAmountBN = amount.mul(wrapTokenFeePercentageBps).div(10000)
      const amountAfterFeeBN = amount.sub(feeAmountBN)

      return {
        feeAmount: utils.formatUnits(feeAmountBN, tokenDecimals).toString(),
        amountAfterFee: utils.formatUnits(amountAfterFeeBN, tokenDecimals).toString(),
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
  }, [tokenAmount, tokenDecimals, wrapTokenFeePercentageBps])
}
