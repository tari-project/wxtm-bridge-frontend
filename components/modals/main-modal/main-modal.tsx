'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { useConnection } from 'wagmi'

import ConnectionModal from '@/components/modals/connection-modal/connection-modal'
import { InfoModal } from '@/components/modals/info-modal'
import { ReviewModal } from '@/components/modals/review-modal'
import { SuccessModal } from '@/components/modals/success-modal'
import { WrapModal } from '@/components/modals/wrap-modal'
import { FailedModal } from '../failed-modal'
import { MainModalProps } from './main-modal.types'

import { useTariAccountStore } from '@/store/account'
import { setExceededDailyLimit, setUnwrapFailed, setUnwrapSuccess } from '@/store/bridge'
import { useBridgeTransaction } from '@/hooks/use-bridge-transaction'
import { useBridgeToEthereum } from '@/hooks/use-bridge-to-ethereum'
import { DeployedChains } from '@tari-project/wxtm-bridge-contracts/deployments/index'
import { useBridgeToTari } from '@/hooks/use-bridge-to-tari'
import { setIsModalOpen, setModalStep } from '@/store/modal'

const DAILY_LIMIT_ERROR = 'Daily wrap limit exceeded'
const DAILY_LIMIT_ERROR_TYPE = 'Forbidden'

export const MainModal = ({
  success,
  failed,
  step,
  amount,
  tariWalletAddress,
  ethereumAddress,
  feesData,
  closeModalAction,
  type,
}: MainModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const tariAccount = useTariAccountStore((s) => s.tariAccount)
  const { address: ethAddress, chain, isConnected } = useConnection()

  const { getUserBackendBridgeTxs } = useBridgeTransaction()
  const { bridgeToEthereum } = useBridgeToEthereum()

  const chainId = (chain?.id ?? 1) as DeployedChains
  const { bridgeToTari, isSuccess, isError, error, isPending } = useBridgeToTari(ethAddress || '0x', chainId)

  const handleBridgeToEthereum = useCallback(() => {
    if (!amount || !ethAddress) {
      return
    }

    bridgeToEthereum({
      amount,
      ethAddress: ethAddress,
      amountAfterFee: feesData.amountAfterFee,
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
          setIsModalOpen(false)
        }
      })
  }, [amount, bridgeToEthereum, ethAddress, feesData.amountAfterFee, getUserBackendBridgeTxs])

  const handleBridgeToTari = async () => {
    if (!amount || !ethAddress || !tariAccount?.address) {
      return
    }
    console.debug(`[ TAPPLET-BRIDGE ] Initiating transaction...`)
    setModalStep(3)
    const success = await bridgeToTari(amount, ethAddress, tariAccount.address)
    if (success) {
      setUnwrapFailed(false)
    } else {
      setUnwrapFailed(true)
    }
  }

  useEffect(() => {
    if (isSuccess) {
      console.debug(`[ TAPPLET-BRIDGE ] Unwrap transaction success!`)
      setModalStep(2)
      setUnwrapSuccess(true)
    } else if (isError) {
      console.error(`[ TAPPLET-BRIDGE ] Unwrap transaction failed:`, error)
      setUnwrapFailed(true)
    }
  }, [isPending, isSuccess, isError, error])

  if (step === 0 && isConnected) return null

  const renderModal = () => {
    if (success)
      return (
        <SuccessModal
          closeModalAction={closeModalAction}
          amount={amount}
          tariWalletAddress={tariWalletAddress}
          ethereumAddress={ethereumAddress}
          type={type}
        />
      )

    if (failed) return <FailedModal closeModalAction={closeModalAction} paymentId={undefined} />

    if (!isConnected && step === 0) return <ConnectionModal closeModalAction={closeModalAction} />
    if (step === 1)
      return (
        <ReviewModal
          amount={amount}
          closeModalAction={closeModalAction}
          ethereumAddress={ethereumAddress}
          tariWalletAddress={tariWalletAddress}
          handleBridgeToEthereum={handleBridgeToEthereum}
          handleBridgeToTari={handleBridgeToTari}
          feesData={feesData}
        />
      )
    if (step === 2)
      return (
        <WrapModal
          closeModalAction={closeModalAction}
          tariWalletAddress={tariWalletAddress}
          ethereumAddress={ethereumAddress}
          feesData={feesData}
          type={type}
        />
      )
    if (step === 3) return <InfoModal />
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <section
        ref={modalRef}
        className="w-full max-w-md mx-4 bg-[#E0DFDE] shadow-[0px_4px_74px_0px_rgba(0,0,0,0.15)] backdrop-blur-[54px] rounded-3xl overflow-hidden flex flex-col justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {renderModal()}
      </section>
    </div>
  )
}
