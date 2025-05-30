'use client'

import React, { useRef } from 'react'
import { useAccount } from 'wagmi'

import ConnectionModal from '@/components/modals/connection-modal/connection-modal'
import { ReviewModal } from '@/components/modals/review-modal'
import { SuccessModal } from '@/components/modals/success-modal'
import { WrapModal } from '@/components/modals/wrap-modal'
import { MainModalProps } from './main-modal.types'
import { FailedModal } from '../failed-modal'

export const MainModal: React.FC<MainModalProps> = ({
  setModalOpen,
  success,
  failed,
  step,
  setStep,
  handleBridgeToEthereum,
  handleBridgeToTari,
  isBridging,
  amount,
  tariWalletAddress,
  ethereumAddress,
  fromNetwork,
  toNetwork,
  feesData,
}) => {
  const { isConnected } = useAccount()
  const modalRef = useRef<HTMLDivElement>(null)

  const closeModal = () => {
    setModalOpen(false)
    setStep(1)
  }

  // const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
  //   if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
  //     closeModal()
  //   }
  // }

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
        />
      )

    if (failed) return <FailedModal closeModal={closeModal} />

    if (!isConnected && step === 0)
      return <ConnectionModal closeModal={closeModal} />
    if (step === 1)
      return (
        <ReviewModal
          amount={amount}
          closeModal={closeModal}
          handleBridgeToEthereum={handleBridgeToEthereum}
          handleBridgeToTari={handleBridgeToTari}
          isBridging={isBridging}
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
        />
      )
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
