'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useForm } from 'react-hook-form'

import { MainModal } from '@/components/modals/main-modal'
import { Header } from '@/components/header'
import { MainComponent } from '@/components/main'
import { useBridgeToEthereum } from '@/hooks/use-bridge-to-ethereum'
import { BridgeFormValues } from '@/components/bridge-input'
import { Network } from '@/components/network-box'
import useTariAccount from '@/store/account'
import useTariSigner from '@/store/signer'
import TariL1Signer from '@/clients/tari-l1-signer'
import { TariL1SignerParameters } from '@/types/tapplet'

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
  const {
    tariAccount,
    isProcessingTransaction,
    addPendingTransaction,
    removePendingTransaction,
  } = useTariAccount()
  const { signer, setSigner } = useTariSigner()
  const { setTariAccount } = useTariAccount()
  console.log('SIGNER', signer)
  console.log('account', tariAccount)

  const {
    watch,
    control,
    formState: { errors, isValid },
  } = useForm<BridgeFormValues>({
    defaultValues: { amount: '' },
    mode: 'onChange',
  })

  const amount = watch('amount')

  // Auto-close modal when connected and on connect step
  useEffect(() => {
    const setAccount = async () => {
      try {
        console.info('🛜 setting account')
        await setTariAccount()
      } catch (error) {
        console.error('Failed to set Tari Account:', error)
      }
    }
    if (!signer) {
      console.info('🛜 signer not found set signer')
      const signerParams: TariL1SignerParameters = {
        name: 'TariL1Signer',
        onConnection: setTariAccount,
      }
      const signer = new TariL1Signer(signerParams)
      setSigner(signer)
    }
    setAccount()
  }, [setSigner, setTariAccount, signer])

  // Auto-close modal when connected and on connect step
  useEffect(() => {
    if (modalOpen && modalStep === 0 && isConnected) {
      setModalOpen(false)
      setModalStep(1)
    } else if (isProcessingTransaction) {
      setModalStep(2)
      setModalOpen(true)
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

    const txId = `bridge-${Date.now()}`

    addPendingTransaction(txId)

    bridgeToEthereum({ amount, ethAddress: address })
      .then(() => {
        setModalStep(2)
      })
      .catch((error) => {
        console.error('Bridge operation failed:', error)

        removePendingTransaction(txId)
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
        isProcessingTransaction={isProcessingTransaction || isBridging}
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
          tariWalletAddress={tariAccount?.address}
          fromNetwork={fromNetwork}
          toNetwork={toNetwork}
        />
      )}
    </main>
  )
}
