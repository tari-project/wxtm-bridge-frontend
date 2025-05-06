'use client'

import React, { useRef } from 'react'
import { useAccount } from 'wagmi'

import ConnectionModal from '@/components/connection-modal'
import { ReviewModal } from '@/components/review-modal'
import SuccessModal from '@/components/success-modal'
import { MainModalProps } from './main-modal.types'
import { WrapModal } from '@/components/wrap-modal'

export const MainModal: React.FC<MainModalProps> = ({
  setModalOpen,
  success,
  step,
  setStep,
  handleBridgeToEthereum,
  isBridging,
  amount,
  tariWalletAddress,
  ethereumAddress,
}) => {
  const { isConnected } = useAccount()
  const modalRef = useRef<HTMLDivElement>(null)

  const closeModal = () => {
    setModalOpen(false)
    setStep(1)
  }

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal()
    }
  }

  // Only render overlay/modal if needed
  if (step === 0 && isConnected) return null

  const renderModal = () => {
    if (success) return <SuccessModal closeModal={closeModal} />

    if (!isConnected && step === 0)
      return <ConnectionModal closeModal={closeModal} />
    if (step === 1)
      return (
        <ReviewModal
          amount={amount}
          closeModal={closeModal}
          handleBridgeToEthereum={handleBridgeToEthereum}
          isBridging={isBridging}
          ethereumAddress={ethereumAddress}
          tariWalletAddress={tariWalletAddress}
        />
      )
    if (step === 2)
      return (
        <WrapModal closeModal={closeModal} ethereumAddress={ethereumAddress} />
      )
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[0px]"
      onClick={handleOutsideClick}
    >
      <section
        ref={modalRef}
        className="w-full max-w-md mx-4 bg-gray-200 backdrop-blur-3xl rounded-3xl overflow-hidden flex flex-col justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {renderModal()}
      </section>
    </div>
  )
}
