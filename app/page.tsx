'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useForm } from 'react-hook-form'

import { MainModal } from '@/components/main-modal'
import Header from '@/components/header'
import { MainComponent, MainFormValues } from '@/components/main'

export default function Home() {
  const { isConnected } = useAccount()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<number>(1) // 0: connect, 2: review, etc.
  const [success] = useState(false)

  const { register, watch, reset } = useForm<MainFormValues>({
    defaultValues: { amount: 1 },
  })

  const amount = watch('amount')

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

  const handleBridgeToEthereum = useCallback(() => {
    console.log('Bridging to Ethereum...', amount)
    setModalStep(2)
    reset()
  }, [amount, reset])

  return (
    <main className="relative min-h-screen w-full flex flex-col px-20">
      <Header onConnectClick={handleConnectClick} />
      <MainComponent
        onConnectClick={handleConnectClick}
        onContinueClick={handleContinueClick}
        register={register}
      />
      {modalOpen && (
        <MainModal
          handleBridgeToEthereum={handleBridgeToEthereum}
          amount={amount}
          setModalOpen={setModalOpen}
          success={success}
          step={modalStep}
          setStep={setModalStep}
        />
      )}
    </main>
  )
}
