import { config } from '@/config'
import { useMutation } from '@tanstack/react-query'

import {
  WrapTokenService,
  OpenAPI,
} from '@tari-project/wxtm-bridge-backend-api'

import { useTariWalletAddress } from './use-tari-wallet-address'
import { TariWalletClient } from '@/clients/tari-wallet-client'
import { parseWxtmTokenAmount } from '@/utils/parse-wxtm-token-amount'

OpenAPI.BASE = config.BACKEND_API_URL

export const useBridgeToEthereum = () => {
  const createTransaction = useMutation({
    mutationFn: WrapTokenService.createWrapTokenTransaction,
  })
  const confirmTokenSent = useMutation({
    mutationFn: WrapTokenService.updateToTokensSent,
  })
  const { tariWalletAddress } = useTariWalletAddress()

  const bridgeToEthereum = async ({
    amount,
    address,
  }: {
    amount: string
    address: `0x${string}`
  }) => {
    const tokenAmount = parseWxtmTokenAmount(amount)

    const { paymentId } = await createTransaction.mutateAsync({
      to: address,
      from: tariWalletAddress,
      tokenAmount,
    })

    await TariWalletClient.transferTokensToColdWallet({
      amount,
      paymentId,
    })

    await confirmTokenSent.mutateAsync(paymentId)
  }

  return {
    bridgeToEthereum,
  }
}
