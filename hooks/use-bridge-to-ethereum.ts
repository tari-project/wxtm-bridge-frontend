import { useMutation } from '@tanstack/react-query'

import {
  UpdateToTokensSentReqDTO,
  UserTransactionDTO,
  WrapTokenService,
} from '@tari-project/wxtm-bridge-backend-api'

import { parseWxtmTokenAmount } from '@/utils/parse-wxtm-token-amount'
import useTariSigner from '@/store/signer'
import useTariAccountStore from '@/store/account'
import useBridgeStore from '@/store/bridge'
import { stringifyProperties } from '@/utils/stringifyProperties'
import { useBridgeTransaction } from './use-bridge-transaction'

export const useBridgeToEthereum = () => {
  const createTransaction = useMutation({
    mutationFn: WrapTokenService.createWrapTokenTransaction,
  })
  const confirmTokenSent = useMutation({
    mutationFn: async ({
      paymentId,
      requestBody,
    }: {
      paymentId: string
      requestBody?: UpdateToTokensSentReqDTO
    }) => WrapTokenService.updateToTokensSent(paymentId, requestBody),
  })
  const getWrapTokenParams = useMutation({
    mutationFn: WrapTokenService.getWrapTokenParams,
  })
  const { getUserBackendBridgeTxs } = useBridgeTransaction()
  const signer = useTariSigner((s) => s.signer)
  const tariAccount = useTariAccountStore((s) => s.tariAccount)
  const tariColdWalletAddress = useBridgeStore((s) => s.tariColdWalletAddress)
  const setTariColdWalletAddress = useBridgeStore(
    (s) => s.setTariColdWalletAddress,
  )
  const setWrapTokenFeePercentageBps = useBridgeStore(
    (s) => s.setWrapTokenFeePercentageBps,
  )
  const setOngoingTransaction = useTariAccountStore(
    (s) => s.setOngoingTransaction,
  )

  const bridgeToEthereum = async ({
    amount,
    ethAddress,
    amountAfterFee,
  }: {
    amount: string
    ethAddress: `0x${string}`
    amountAfterFee: string
  }) => {
    if (!tariAccount || !signer) return

    const parsedAmount = parseWxtmTokenAmount(amount)

    const baseNodeStatusBefore = await signer?.getBaseNodeStatus()
    const { paymentId } = await createTransaction.mutateAsync({
      to: ethAddress,
      from: tariAccount.address,
      tokenAmount: parsedAmount,
      debug: stringifyProperties(baseNodeStatusBefore),
    })

    // set ongoing to immediately display wrap modal
    setOngoingTransaction({
      destinationAddress: ethAddress,
      tokenAmount: parsedAmount,
      amountAfterFee: parseWxtmTokenAmount(amountAfterFee),
      status: UserTransactionDTO.status.PENDING,
      createdAt: '',
      paymentId: paymentId,
    })
    console.debug('[ TAPPLET-BRIDGE ] created tx with id: ', paymentId)

    // the amount is parsed in TU in the `send_one_sided_to_stealth_address` function
    // so here it is necessary to pass the value entered by the user as is
    const isSend = await signer?.sendOneSided({
      amount: amount,
      address: tariColdWalletAddress,
      paymentId: paymentId,
    })

    // add this line to store ongoing tx also in the TU to check on tapplet reload
    // if any previous tx was finished with success/fail status to display it to a user
    await signer?.setOngoingBridgeTx({
      amount: amount,
      amountToReceive: amountAfterFee,
      destinationAddress: ethAddress,
      paymentId: paymentId,
    })

    // get user txs to update history immediately after the tx starts
    await getUserBackendBridgeTxs()

    if (!isSend) {
      console.error('[ TAPPLET-BRIDGE ] send one sided failed')
    }

    const baseNodeStatusAfter = await signer?.getBaseNodeStatus()
    const { success } = await confirmTokenSent.mutateAsync({
      paymentId,
      requestBody: {
        debug: stringifyProperties(baseNodeStatusAfter),
      },
    })
    if (!success) {
      console.error('[ TAPPLET-BRIDGE ] confirm token sent failed')
    }
  }

  const getBridgeTxParams = async () => {
    try {
      const { coldWalletAddress, wrapTokenFeePercentageBps } =
        await getWrapTokenParams.mutateAsync()

      setTariColdWalletAddress(coldWalletAddress)
      setWrapTokenFeePercentageBps(wrapTokenFeePercentageBps)
    } catch (error) {
      console.error('[ TAPPLET-BRIDGE ] Failed to fetch token params:', error)
    }
  }

  return {
    bridgeToEthereum,
    getBridgeTxParams,
  }
}
