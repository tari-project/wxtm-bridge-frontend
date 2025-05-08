import { useMemo } from 'react'
import { parseUnits, formatUnits } from 'ethers'

import { config } from '@/config'
import { BridgeToEthereumFees } from './use-bridge-to-ethereum-fees.types'

export const useBridgeToEthereumFees = (
  tokenAmount: string,
): BridgeToEthereumFees => {
  return useMemo(() => {
    try {
      const amount = parseUnits(tokenAmount, 6)

      const feeAmountBN =
        (amount * BigInt(config.FEE_PERCENTAGE_BPS)) / BigInt(10000)
      const amountAfterFeeBN = amount - feeAmountBN

      return {
        feeAmount: formatUnits(feeAmountBN, 6).toString(),
        amountAfterFee: formatUnits(amountAfterFeeBN, 6).toString(),
        feePercentage: config.FEE_PERCENTAGE_BPS / 100,
      }
    } catch (error) {
      console.error('Could not estimate Eth fees: ', error)

      return {
        feeAmount: '0',
        amountAfterFee: '0',
        feePercentage: 0,
      }
    }
  }, [tokenAmount])
}
