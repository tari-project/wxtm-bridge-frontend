'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useForm } from 'react-hook-form'

import { MainModal } from '@/components/modals/main-modal'
import { Header } from '@/components/header'
import { MainComponent } from '@/components/main'
import { useBridgeToEthereum } from '@/hooks/use-bridge-to-ethereum'
import { useTariWalletAddress } from '@/hooks/use-tari-wallet-address'
import { BridgeFormValues } from '@/components/bridge-input'
import { Network } from '@/components/network-box'

export default function Home() {
  const { isConnected, address } = useAccount()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<number>(1)
  const [success] = useState(false)
  const [fromNetwork, setFromNetwork] = useState<Network>({
    name: 'Tari',
    icon: '/icons/tari.png',
  })
  const [toNetwork, setToNetwork] = useState<Network>({
    name: 'Ethereum',
    icon: '/icons/eth.png',
  })

  const { bridgeToEthereum, isBridging } = useBridgeToEthereum()
  const { tariWalletAddress } = useTariWalletAddress()

  const {
    watch,
    control,
    formState: { errors, isValid },
  } = useForm<BridgeFormValues>({
    defaultValues: { amount: '1' },
    mode: 'onChange',
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

  const handleBridgeToTari = () => {
    console.log('Bridging to Tari...')
    setModalStep(2)
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col px-20 items-center justify-center">
      <Header onConnectClick={handleConnectClick} />
      <MainComponent
        onConnectClick={handleConnectClick}
        onContinueClick={handleContinueClick}
        control={control}
        errors={errors}
        isValid={isValid}
        fromNetwork={fromNetwork}
        setFromNetwork={setFromNetwork}
        toNetwork={toNetwork}
        setToNetwork={setToNetwork}
      />
      {modalOpen && (
        <MainModal
          setModalOpen={setModalOpen}
          success={success}
          step={modalStep}
          setStep={setModalStep}
          handleBridgeToEthereum={handleBridgeToEthereum}
          handleBridgeToTari={handleBridgeToTari}
          isBridging={isBridging}
          amount={amount}
          ethereumAddress={address}
          tariWalletAddress={tariWalletAddress}
          fromNetwork={fromNetwork}
          toNetwork={toNetwork}
        />
      )}
    </main>
  )
}
