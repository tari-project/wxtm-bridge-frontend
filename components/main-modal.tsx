'use client'

import ConnectionModal from '@/components/connection-modal'
import BridgeModal from '@/components/bridge-modal'
import ReviewModal from '@/components/review-modal'
import WrappingModal from './wrapping-modal'
import React, { useRef, useState } from 'react'
import { useAccount } from 'wagmi'

type MainModalProps = {
  setModalOpen: (open: boolean) => void
}

const MainModal: React.FC<MainModalProps> = ({ setModalOpen }) => {
  const [step, setStep] = useState<number>(1)
  const { isConnected } = useAccount()
  const modalRef = useRef<HTMLDivElement>(null)

  const closeModal = () => {
    setModalOpen(false)
    setStep(1)
  }

  const nextStep = () => setStep((prev) => prev + 1)

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal()
    }
  }

  const renderModal = () => {
    if (!isConnected) return <ConnectionModal closeModal={closeModal} />
    if (step === 1)
      return <BridgeModal closeModal={closeModal} nextStep={nextStep} />
    if (step === 2)
      return <ReviewModal closeModal={closeModal} nextStep={nextStep} />
    if (step === 3) return <WrappingModal closeModal={closeModal} />
  }

  return step !== -1 ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[0px]"
      onClick={step === 3 ? handleOutsideClick : undefined} // Enable modal close on click outside modal for last step only
    >
      <section
        ref={modalRef}
        className="w-full max-w-md mx-4 bg-gray-200 backdrop-blur-3xl rounded-3xl overflow-hidden flex flex-col justify-center items-center"
      >
        {renderModal()}
      </section>
    </div>
  ) : null
}

export default MainModal
