import { config } from '@/config'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import {
  WrapTokenService,
  OpenAPI,
} from '@tari-project/wxtm-bridge-backend-api'

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

    console.log('[TAPPLET] start bridging to eth')
    const { paymentId } = await createTransaction.mutateAsync({
      to: ethAddress,
      from: tariAccount.address,
      tokenAmount,
    })
    console.log('[TAPPLET] response from mutate paymentid:', paymentId)

    // TODO how can we get tari address to send XTM?
    const tariColdWalletAddress =
      'f2Kjz1SH4vRSXpNSb15SUNoECBNkxE57USorF7PpXT7hT4pJ1QViLMzinU5WiEoPn7m6hZ1BmS7AGPXAr4WpdNAU65m'

    const isSend = await signer?.sendOneSided({
      amount,
      address: tariColdWalletAddress,
      message: paymentId,
    })

    console.log('[TAPPLET] send one sided done? ', isSend)
    const { success } = await confirmTokenSent.mutateAsync(paymentId)
    console.log('[TAPPLET] confirm token sent success: ', success)

    setIsBridging(false)
  }

  return {
    bridgeToEthereum,
    isBridging,
  }
}
