import { config } from '@/config'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import {
  WrapTokenService,
  OpenAPI,
} from '@tari-project/wxtm-bridge-backend-api'

// import { useTariWalletAddress } from './use-tari-wallet-address'
import { parseWxtmTokenAmount } from '@/utils/parse-wxtm-token-amount'
import useTariSigner from '@/store/signer'
import useTariAccount from '@/store/account'

OpenAPI.BASE = config.BACKEND_API_URL

export const useBridgeToEthereum = () => {
  const createTransaction = useMutation({
    mutationFn: WrapTokenService.createWrapTokenTransaction,
  })
  const confirmTokenSent = useMutation({
    mutationFn: WrapTokenService.updateToTokensSent,
  })
  // const { tariWalletAddress } = useTariWalletAddress()
  const { signer } = useTariSigner()
  const { tariAccount } = useTariAccount()
  const [isBridging, setIsBridging] = useState(false)

  const bridgeToEthereum = async ({
    amount,
    ethAddress,
  }: {
    amount: string
    ethAddress: `0x${string}`
  }) => {
    setIsBridging(true)
    if (!tariAccount) return
    const tokenAmount = parseWxtmTokenAmount(amount)

    const { paymentId } = await createTransaction.mutateAsync({
      to: ethAddress,
      from: tariAccount.address,
      tokenAmount,
    })

    // TODO how can we get tari address to send XTM?
    const tariColdWalletAddress =
      'f22p3ubvTRM2SW6qrBg1gYb2gSbrWygByywTv14YU13umzphPWV2jDkZHZb1WN7nLKsYTesaZEnGt3vTpVoQBrhZxHj'

    //
    await signer?.sendOneSided({
      amount,
      address: tariColdWalletAddress,
      message: paymentId,
    })

    await confirmTokenSent.mutateAsync(paymentId)

    setIsBridging(false)
  }

  return {
    bridgeToEthereum,
    isBridging,
  }
}
