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

    console.debug('[ TAPPLET-BRIDGE ] start bridging to eth')
    const { paymentId } = await createTransaction.mutateAsync({
      to: ethAddress,
      from: tariAccount.address,
      tokenAmount,
    })
    console.debug('[ TAPPLET-BRIDGE ] created tx with id: ', paymentId)

    const isSend = await signer?.sendOneSided({
      amount,
      address: config.TARI_BRIDGE_COLDWALLET_ADDRESS,
      message: paymentId,
    })

    if (!isSend) {
      console.error('[ TAPPLET-BRIDGE ] send one sided failed')
    }

    const { success } = await confirmTokenSent.mutateAsync(paymentId)
    if (!success) {
      console.error('[ TAPPLET-BRIDGE ] confirm token sent failed')
    }

    setIsBridging(false)
  }

  return {
    bridgeToEthereum,
    isBridging,
  }
}
