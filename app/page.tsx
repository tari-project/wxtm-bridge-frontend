'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useForm } from 'react-hook-form'

import { MainModal } from '@/components/main-modal'
import Header from '@/components/header'
import { MainComponent } from '@/components/main'
import { useBridgeToEthereum } from '@/hooks/use-bridge-to-ethereum'
import { useTariWalletAddress } from '@/hooks/use-tari-wallet-address'
import { TariToEthFormValues } from '@/components/tari-to-eth-input'

export default function Home() {
  const { isConnected, address } = useAccount()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<number>(1) // 0: connect, 2: review, etc.
  const [success] = useState(false)
  const { bridgeToEthereum, isBridging } = useBridgeToEthereum()
  const { tariWalletAddress } = useTariWalletAddress()

  const {
    watch,
    control,
    formState: { errors, isValid },
  } = useForm<TariToEthFormValues>({
    defaultValues: { amount: '1' },
    mode: 'onChange',
  })

  const amount = watch('amount')

  // Auto-close modal when connected and on connect step
  //TODO
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
    setModalStep(1)
    setModalOpen(true)
  }

  const handleBridgeToEthereum = useCallback(() => {
    if (!amount || !address) {
      return
    }

    bridgeToEthereum({ amount, address }).then(() => {
      setModalStep(2)
    })
  }, [amount, address, bridgeToEthereum])

  return (
    <main className="relative min-h-screen w-full flex flex-col px-20 items-center justify-center">
      <Header onConnectClick={handleConnectClick} />
      <MainComponent
        onConnectClick={handleConnectClick}
        onContinueClick={handleContinueClick}
        control={control}
        errors={errors}
        isValid={isValid}
      />
      {modalOpen && (
        <MainModal
          handleBridgeToEthereum={handleBridgeToEthereum}
          isBridging={isBridging}
          amount={amount}
          setModalOpen={setModalOpen}
          success={success}
          step={modalStep}
          setStep={setModalStep}
          tariWalletAddress={tariWalletAddress}
          ethereumAddress={address}
        />
      )}
    </main>
  )
}
