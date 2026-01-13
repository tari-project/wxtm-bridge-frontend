import { useCallback, useEffect } from 'react'
import useTariAccountStore, { setExceededDailyLimit } from '@/store/account'
import { useConnection } from 'wagmi'
import { BridgeFees } from '@/hooks/use-bridge-fees'
import { useBridgeTransaction } from '@/hooks/use-bridge-transaction'
import { useBridgeToEthereum } from '@/hooks/use-bridge-to-ethereum'
import { useBridgeToTari } from '@/hooks/use-bridge-to-tari'
import type { DeployedChains } from '@/types/contracts'
import { setIsModalOpen, setModalStep } from '@/store/modal'
import { setUnwrapFailed } from '@/store/bridge'

const DAILY_LIMIT_ERROR = 'Daily wrap limit exceeded'
const DAILY_LIMIT_ERROR_TYPE = 'Forbidden'

interface UseBridgeActionsProps {
  amount: string
  feesData: BridgeFees
  closeCallback: () => void
}
export function useBridgeActions({ amount, feesData, closeCallback }: UseBridgeActionsProps) {
  const tariAccount = useTariAccountStore((s) => s.tariAccount)

  const { address: ethAddress, chain } = useConnection()
  const { getUserBackendBridgeTxs } = useBridgeTransaction()
  const { bridgeToEthereum } = useBridgeToEthereum()

  const chainId = (chain?.id ?? 1) as DeployedChains
  const { bridgeToTari, isSuccess, isError, error } = useBridgeToTari(ethAddress || '0x', chainId)

  const { amountAfterFee } = feesData

  const handleBridgeToEthereum = useCallback(() => {
    if (!amount || !ethAddress) {
      return
    }

    bridgeToEthereum({
      amount,
      ethAddress: ethAddress,
      amountAfterFee,
    })
      .then(async () => {
        await getUserBackendBridgeTxs()
        setExceededDailyLimit(false)
      })
      .catch((e) => {
        console.error('[ TAPPLET-BRIDGE ] Bridge operation failed:', e)
        const error = e as Error
        const isLimitError =
          error?.message?.includes(DAILY_LIMIT_ERROR_TYPE) || error?.message?.includes(DAILY_LIMIT_ERROR)
        setExceededDailyLimit(isLimitError)
        if (isLimitError) {
          closeCallback()
        }
      })
  }, [amount, amountAfterFee, bridgeToEthereum, closeCallback, ethAddress, getUserBackendBridgeTxs])

  const handleBridgeToTari = useCallback(async () => {
    if (!amount || !ethAddress || !tariAccount?.address) {
      return
    }
    console.debug(`[ TAPPLET-BRIDGE ] Initiating transaction...`)

    setIsModalOpen(true)
    setModalStep(3)

    await bridgeToTari(amount, ethAddress, tariAccount.address)
  }, [amount, bridgeToTari, ethAddress, tariAccount])

  useEffect(() => {
    if (isSuccess) {
      console.debug(`[ TAPPLET-BRIDGE ] Unwrap transaction success!`)
      setModalStep(2)
      return
    }

    if (isError) {
      console.error(`[ TAPPLET-BRIDGE ] Unwrap transaction failed:`, error)
      setUnwrapFailed(true)
    }
  }, [error, isError, isSuccess])

  return {
    handleBridgeToEthereum,
    handleBridgeToTari,
  }
}
