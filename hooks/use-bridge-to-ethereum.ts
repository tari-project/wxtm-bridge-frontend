// import { config } from '@/config'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import {
  WrapTokenService,
  // OpenAPI,
} from '@tari-project/wxtm-bridge-backend-api'

import { parseWxtmTokenAmount } from '@/utils/parse-wxtm-token-amount'
import useTariSigner from '@/store/signer'
import useTariAccount from '@/store/account'

// OpenAPI.BASE = config.BACKEND_API_URL

export const useBridgeToEthereum = () => {
  const createTransaction = useMutation({
    mutationFn: WrapTokenService.createWrapTokenTransaction,
  })
  const confirmTokenSent = useMutation({
    mutationFn: WrapTokenService.updateToTokensSent,
  })
  const getWrapTokenParams = useMutation({
    mutationFn: WrapTokenService.getWrapTokenParams,
  })
  const { signer } = useTariSigner()
  const { tariAccount } = useTariAccount()
  const [isBridging, setIsBridging] = useState(false)

  const bridgeToEthereum = async ({
    amount,
    amountAfterFee,
    ethAddress,
  }: {
    amount: string
    amountAfterFee: string
    ethAddress: `0x${string}`
  }) => {
    setIsBridging(true)
    if (!tariAccount || !signer) return

    const parsedAmount = parseWxtmTokenAmount(amount)

    console.debug(
      '[ TAPPLET-BRIDGE ] start bridging to eth with amount:',
      parsedAmount,
    )
    const { coldWalletAddress } = await getWrapTokenParams.mutateAsync()
    const { paymentId } = await createTransaction.mutateAsync({
      to: ethAddress,
      from: tariAccount.address,
      tokenAmount: parsedAmount,
    })
    console.debug('[ TAPPLET-BRIDGE ] created tx with id: ', paymentId)

    // the amount is parsed in TU in the `send_one_sided_to_stealth_address` function
    // so here it is necessary to pass the value entered by the user as is
    const isSend = await signer?.sendOneSided({
      amount: amount,
      address: coldWalletAddress,
      paymentId: paymentId,
    })

    await signer?.addPendingTappletTx({
      amount: amount,
      amountToReceive: amountAfterFee,
      destinationAddress: ethAddress,
      paymentId: paymentId,
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
