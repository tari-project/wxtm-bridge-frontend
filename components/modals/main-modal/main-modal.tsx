'use client'

import React, { useRef } from 'react'
import { useAccount } from 'wagmi'

import ConnectionModal from '@/components/modals/connection-modal/connection-modal'
import { InfoModal } from '@/components/modals/info-modal'
import { ReviewModal } from '@/components/modals/review-modal'
import { SuccessModal } from '@/components/modals/success-modal'
import { WrapModal } from '@/components/modals/wrap-modal'
import { FailedModal } from '../failed-modal'
import { MainModalProps } from './main-modal.types'

export const MainModal: React.FC<MainModalProps> = ({
  success,
  failed,
  step,
  handleBridgeToEthereum,
  handleBridgeToTari,
  amount,
  tariWalletAddress,
  ethereumAddress,
  fromNetwork,
  toNetwork,
  feesData,
  closeModal,
  type,
}) => {
  const { isConnected } = useAccount()
  const modalRef = useRef<HTMLDivElement>(null)

  if (step === 0 && isConnected) return null

  const renderModal = () => {
    if (success)
      return (
        <SuccessModal
          closeModal={closeModal}
          amount={amount}
          tariWalletAddress={tariWalletAddress}
          ethereumAddress={ethereumAddress}
          fromNetwork={fromNetwork}
          type={type}
        />
      )

    if (failed) return <FailedModal closeModal={closeModal} paymentId={undefined} fromNetwork={fromNetwork.name} />

    if (!isConnected && step === 0) return <ConnectionModal closeModal={closeModal} />
    if (step === 1)
      return (
        <ReviewModal
          amount={amount}
          closeModal={closeModal}
          handleBridgeToEthereum={handleBridgeToEthereum}
          handleBridgeToTari={handleBridgeToTari}
          ethereumAddress={ethereumAddress}
          tariWalletAddress={tariWalletAddress}
          fromNetwork={fromNetwork}
          toNetwork={toNetwork}
          feesData={feesData}
        />
      )
    if (step === 2)
      return (
        <WrapModal
          closeModal={closeModal}
          tariWalletAddress={tariWalletAddress}
          ethereumAddress={ethereumAddress}
          fromNetwork={fromNetwork}
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
