'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
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
import { UserTransactionDTO } from '@tari-project/wxtm-bridge-backend-api'

export default function Home() {
  const { isConnected, address: ethAddress } = useAccount()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<number>(1)
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
  const {
    tariAccount,
    isInProgressBridgeTx,
    inProgressBridgeTx,
    setPendingTransaction,
  } = useTariAccount()
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

  // Ref to keep track of latest inProgressBridgeTx for comparison
  const pendingBridgeTxRef = useRef(inProgressBridgeTx)

  useEffect(() => {
    console.warn(
      '[ TAPPLET-BRIDGE ][useEffect] inProgressBridgeTx:',
      inProgressBridgeTx,
    )
    pendingBridgeTxRef.current = inProgressBridgeTx
  }, [inProgressBridgeTx])

  // Fetch bridge transaction parameters once on mount or when tariAccount changes
  useEffect(() => {
    console.warn(
      '!!!!! [ TAPPLET-BRIDGE ][useEffect] get bridge tx params',
      tariAccount,
    )

    if (!tariAccount) return

    const fetchBridgeTxParams = async () => {
      try {
        await getBridgeTxParams()
      } catch (error) {
        console.error(
          '[ TAPPLET-BRIDGE ] Failed to get bridge transaction params:',
          error,
        )
      }
    }

    fetchBridgeTxParams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tariAccount])

  // Fetch user transactions every 1 minute and update only if changed
  useEffect(() => {
    console.warn(
      '!!!!! [ TAPPLET-BRIDGE ][useEffect] update state current tx:',
      pendingBridgeTxRef,
    )

    if (!tariAccount) return

    const fetchUserTransactions = async () => {
      try {
        const updatedPendingTx = await getUserTransactions(
          tariAccount.address,
          pendingBridgeTxRef.current,
        )

        // Compare previous and updated pending tx by id (adjust as needed)
        const currentTxStatus = pendingBridgeTxRef.current?.status
        const updatedTxStatus = updatedPendingTx?.status
        console.warn(
          '!!!!! [ TAPPLET-BRIDGE ][useEffect] update state new status:',
          updatedPendingTx,
        )

        if (
          updatedPendingTx &&
          currentTxStatus !== updatedTxStatus &&
          updatedPendingTx.status === UserTransactionDTO.status.PENDING
        ) {
          console.warn(
            '!!!!! [ TAPPLET-BRIDGE ][useEffect] STATUS CHANGED',
            updatedPendingTx,
          )

          setPendingTransaction(updatedPendingTx)
        }
        if (
          updatedPendingTx &&
          currentTxStatus !== updatedTxStatus &&
          updatedPendingTx.status === UserTransactionDTO.status.SUCCESS
        ) {
          console.warn(
            '!!!!! [ TAPPLET-BRIDGE ][useEffect] STATUS CHANGED',
            updatedPendingTx,
          )
        }
      } catch (error) {
        console.error(
          '[ TAPPLET-BRIDGE ] Failed to get user transactions:',
          error,
        )
      }
    }

    // Initial fetch
    fetchUserTransactions()

    // Poll every 60 seconds
    const intervalId = setInterval(fetchUserTransactions, 10000)

    return () => {
      clearInterval(intervalId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tariAccount])

  // Auto-close modal when connected and on connect step
  useEffect(() => {
    if (modalOpen && modalStep === 0 && isConnected) {
      setModalOpen(false)
      setModalStep(1)
    } else if (isInProgressBridgeTx) {
      setModalStep(2)
      setModalOpen(true)
    }
  }, [isConnected, modalOpen, modalStep, isInProgressBridgeTx])

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
      ethAddress: ethAddress,
    })
      .then(() => {
        setModalStep(2)
      })
      .catch((error) => {
        console.error('[ TAPPLET-BRIDGE ] Bridge operation failed:', error)
      })
  }, [amount, ethAddress, bridgeToEthereum])

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
        isInProgressBridgeTx={isInProgressBridgeTx || isBridging}
      />
      {modalOpen && (
        <MainModal
          setModalOpen={setModalOpen}
          success={
            inProgressBridgeTx?.status === UserTransactionDTO.status.SUCCESS
          }
          failed={
            inProgressBridgeTx?.status === UserTransactionDTO.status.TIMEOUT
          }
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
