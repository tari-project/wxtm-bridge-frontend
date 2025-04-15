'use client'

import ConnectionModal from '@/components/connection-modal'
import BridgeModal from '@/components/bridge-modal'
import ReviewModal from '@/components/review-modal'
import React, { useState } from 'react'
import { useAccount } from 'wagmi'

const MainModal = () => {
  const { isConnected } = useAccount()
  const [step, setStep] = useState<number>(0)

  const closeModal = () => setStep(-1)
  const goToNextStep = () => setStep((prev) => prev + 1)

  function RenderModal() {
    if (step === -1) return null
    if (!isConnected) return <ConnectionModal closeModal={closeModal} />
    if (step === 0)
      return <BridgeModal closeModal={closeModal} goToNextStep={goToNextStep} />
    if (step === 1) return <ReviewModal closeModal={closeModal} />
    return null
  }

  return step !== -1 ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[0px]">
      <section className="w-full max-w-md mx-4 bg-gray-200 backdrop-blur-3xl rounded-3xl overflow-hidden flex flex-col justify-center items-center">
        <RenderModal />
      </section>
    </div>
  ) : null
}

export default MainModal
