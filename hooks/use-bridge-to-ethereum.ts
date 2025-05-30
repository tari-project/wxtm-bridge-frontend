import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { WrapTokenService } from '@tari-project/wxtm-bridge-backend-api'

import { parseWxtmTokenAmount } from '@/utils/parse-wxtm-token-amount'
import useTariSigner from '@/store/signer'
import useTariAccount from '@/store/account'

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
  const {
    tariAccount,
    tariColdWalletAddress,
    setWrapTokenFeePercentageBps,
    setTariColdWalletAddress,
  } = useTariAccount()
  const [isBridging, setIsBridging] = useState(false)

  const bridgeToEthereum = async ({
    amount,
    ethAddress,
  }: {
    amount: string
    ethAddress: `0x${string}`
  }) => {
    setIsBridging(true)
    if (!tariAccount || !signer) return

    const parsedAmount = parseWxtmTokenAmount(amount)

    console.debug(
      '[ TAPPLET-BRIDGE ] start bridging to eth with amount:',
      parsedAmount,
    )

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
      address: tariColdWalletAddress,
      paymentId: paymentId,
    })

    // await signer?.addPendingTappletTx({
    //   amount: amount,
    //   amountToReceive: amountAfterFee,
    //   destinationAddress: ethAddress,
    //   paymentId: paymentId,
    // })

    if (!isSend) {
      console.error('[ TAPPLET-BRIDGE ] send one sided failed')
    }

    const { success } = await confirmTokenSent.mutateAsync(paymentId)
    if (!success) {
      console.error('[ TAPPLET-BRIDGE ] confirm token sent failed')
    }

    setIsBridging(false)
  }

  const getBridgeTxParams = async () => {
    try {
      const { coldWalletAddress, wrapTokenFeePercentageBps } =
        await getWrapTokenParams.mutateAsync()

      setTariColdWalletAddress(coldWalletAddress)
      setWrapTokenFeePercentageBps(wrapTokenFeePercentageBps)
      console.warn(
        '!!!!! [ TAPPLET-BRIDGE ][gettxparams] set bridge tx params',
        coldWalletAddress,
        wrapTokenFeePercentageBps,
      )
    } catch (error) {
      console.error('[ TAPPLET-BRIDGE ] Failed to fetch token params:', error)
    }
  }

  return {
    bridgeToEthereum,
    isBridging,
    getBridgeTxParams,
  }
}
