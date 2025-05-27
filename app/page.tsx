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
import { useBridgeToEthereumFees } from '@/hooks/use-bridge-to-ethereum-fees'
import { useBridgeTransaction } from '@/hooks/use-bridge-transaction'

export default function Home() {
  const { isConnected, address: ethAddress } = useAccount()
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

  const { bridgeToEthereum, isBridging, getBridgeTxParams } =
    useBridgeToEthereum()
  const { tariAccount, isProcessingTransaction, pendingBridgeTx } =
    useTariAccount()
  const { getUserTransactions } = useBridgeTransaction()

  const {
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<BridgeFormValues>({
    defaultValues: { amount: '' },
    mode: 'onChange',
  })

  const amount = watch('amount')
  const feesData = useBridgeToEthereumFees(amount)

  useEffect(() => {
    if (tariAccount) {
      const fetchUserTransactions = async () => {
        try {
          await getUserTransactions(tariAccount.address, pendingBridgeTx)
          await getBridgeTxParams()
        } catch (error) {
          console.error(
            '[ TAPPLET-BRIDGE ] Failed to get user transactions:',
            error,
          )
        }
      }

      fetchUserTransactions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tariAccount])

  // Auto-close modal when connected and on connect step
  useEffect(() => {
    if (modalOpen && modalStep === 0 && isConnected) {
      setModalOpen(false)
      setModalStep(1)
    } else if (isProcessingTransaction) {
      setModalStep(2)
      setModalOpen(true)
    }
  }, [isConnected, modalOpen, modalStep, isProcessingTransaction])

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
    if (!amount || !ethAddress) {
      return
    }

    bridgeToEthereum({
      amount,
      amountAfterFee: feesData.amountAfterFee,
      ethAddress: ethAddress,
    })
      .then(() => {
        setModalStep(2)
      })
      .catch((error) => {
        console.error('[ TAPPLET-BRIDGE ] Bridge operation failed:', error)
      })
  }, [amount, ethAddress, bridgeToEthereum, feesData])

  const handleBridgeToTari = () => {
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
        setValue={setValue}
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
          ethereumAddress={ethAddress}
          tariWalletAddress={tariAccount?.address}
          fromNetwork={fromNetwork}
          toNetwork={toNetwork}
          feesData={feesData}
        />
      )}
    </main>
  )
}
