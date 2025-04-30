'use client'

import React, { useState, useEffect } from 'react'
import MainModal from '@/components/main-modal'
import Main from '@/components/main'
import Header from '@/components/header'
import { useAccount } from 'wagmi'

export default function Home() {
  const { isConnected } = useAccount()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<number>(1) // 0: connect, 2: review, etc.
  const [success] = useState(false)

  // Auto-close modal when connected and on connect step
  useEffect(() => {
    if (modalOpen && modalStep === 0 && isConnected) {
      setModalOpen(false)
      setModalStep(1)
    }
  }, [isConnected, modalOpen, modalStep])

  const handleConnectClick = () => {
    if (!isConnected) {
      setModalStep(0)
      setModalOpen(true)
    }
  }

  const handleContinueClick = () => {
    if (isConnected) {
      setModalStep(1)
      setModalOpen(true)
    }
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col px-20">
      <Header onConnectClick={handleConnectClick} />
      <Main
        onConnectClick={handleConnectClick}
        onContinueClick={handleContinueClick}
      />
      {modalOpen && (
        <MainModal
          setModalOpen={setModalOpen}
          success={success}
          step={modalStep}
          setStep={setModalStep}
        />
      )}
    </main>
  )
}
