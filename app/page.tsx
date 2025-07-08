'use client'
import './i18initializer'
import React, { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useForm } from 'react-hook-form'

import { MainModal } from '@/components/modals/main-modal'
import { TransactionDetailsModal } from '@/components/modals/transaction-details-modal'
import { Header } from '@/components/header'
import { MainComponent } from '@/components/main'
import { useBridgeToEthereum } from '@/hooks/use-bridge-to-ethereum'
import { BridgeFormValues } from '@/components/bridge-input'
import { Network } from '@/components/network-box'
import useTariAccountStore from '@/store/account'
import { useBridgeToEthereumFees } from '@/hooks/use-bridge-to-ethereum-fees'
import { useBridgeTransaction } from '@/hooks/use-bridge-transaction'
import { UserTransactionDTO } from '@tari-project/wxtm-bridge-backend-api'

export default function Home() {
  const { isConnected, address: ethAddress } = useAccount()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<number>(1)
  const [lastShownTxId, setLastShownTxId] = useState<string | null>(null)
  const [fromNetwork, setFromNetwork] = useState<Network>({
    name: 'Tari',
    icon: '/icons/tari.png',
  })
  const [toNetwork, setToNetwork] = useState<Network>({
    name: 'Ethereum',
    icon: '/icons/eth.png',
  })

  const { bridgeToEthereum, getBridgeTxParams } = useBridgeToEthereum()
  const { getUserBackendBridgeTxs } = useBridgeTransaction()
  const tariAccount = useTariAccountStore((s) => s.tariAccount)
  const detailedTx = useTariAccountStore((s) => s.detailedTx) // USE THIS TO DISPLAY MODAL WITH TX DETAILS
  const setDetailedTx = useTariAccountStore((s) => s.setDetailedTx) // USE THIS TO CLOSE MODAL: setDetailedTx(null)
  const ongoingBridgeTx = useTariAccountStore((s) => s.ongoingBridgeTx)
  const setOngoingBridgeTx = useTariAccountStore((s) => s.setOngoingTransaction)

  // Prevent main modal from showing when transaction details modal is active
  const isTransactionDetailsOpen = !!detailedTx

  const {
    watch,
    control,
    setValue,
    formState: { errors, isValid },
    resetField,
  } = useForm<BridgeFormValues>({
    defaultValues: { amount: '' },
    mode: 'onChange',
  })

  const amount = watch('amount')
  const feesData = useBridgeToEthereumFees(amount)

  // Fetch bridge transaction parameters once on mount or when tariAccount changes
  useEffect(() => {
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

  useEffect(() => {
    if (!tariAccount) return

    const fetchUserTransactions = async () => {
      try {
        await getUserBackendBridgeTxs()
      } catch (error) {
        console.error(
          '[ TAPPLET-BRIDGE ] Failed to get user transactions:',
          error,
        )
      }
    }

    fetchUserTransactions()
    // Poll every 30 sec
    const intervalId = setInterval(fetchUserTransactions, 30000)

    return () => {
      clearInterval(intervalId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tariAccount])

  useEffect(() => {
    if (modalOpen && modalStep === 0 && isConnected) {
      setModalOpen(false)
      setModalStep(1)
    } else if (
      ongoingBridgeTx &&
      !ongoingBridgeTx.modalClosedByUser &&
      !isTransactionDetailsOpen &&
      ongoingBridgeTx.paymentId !== lastShownTxId
    ) {
      setModalStep(2)
      setModalOpen(true)
      setLastShownTxId(ongoingBridgeTx.paymentId)
    } else if (isTransactionDetailsOpen && modalOpen) {
      setModalOpen(false)
    }
  }, [
    isConnected,
    modalOpen,
    modalStep,
    ongoingBridgeTx,
    isTransactionDetailsOpen,
    lastShownTxId,
  ])

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
  const handleSetOngoingModalOpen = (open: boolean) => {
    setModalOpen(open)
    if (ongoingBridgeTx)
      setOngoingBridgeTx({ ...ongoingBridgeTx, modalClosedByUser: true })
  }

  const handleBridgeToEthereum = useCallback(() => {
    if (!amount || !ethAddress) {
      return
    }

    bridgeToEthereum({
      amount,
      ethAddress: ethAddress,
      amountAfterFee: feesData.amountAfterFee,
    })
      .then(() => {
        getUserBackendBridgeTxs()
      })
      .catch((error) => {
        console.error('[ TAPPLET-BRIDGE ] Bridge operation failed:', error)
      })
  }, [
    amount,
    ethAddress,
    bridgeToEthereum,
    feesData.amountAfterFee,
    getUserBackendBridgeTxs,
  ])

  const handleBridgeToTari = () => {
    setModalStep(2)
  }

  const handleCloseModal = () => {
    resetField('amount', { defaultValue: '' })
    handleSetOngoingModalOpen(false)
    setModalStep(1)
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
      />

      {detailedTx && (
        <TransactionDetailsModal
          transaction={detailedTx}
          closeModal={() => setDetailedTx(null)}
        />
      )}

      {modalOpen && !isTransactionDetailsOpen && (
        <MainModal
          success={
            ongoingBridgeTx?.status === UserTransactionDTO.status.SUCCESS
          }
          failed={ongoingBridgeTx?.status === UserTransactionDTO.status.TIMEOUT}
          step={modalStep}
          handleBridgeToEthereum={handleBridgeToEthereum}
          handleBridgeToTari={handleBridgeToTari}
          amount={amount}
          ethereumAddress={ethAddress}
          tariWalletAddress={tariAccount?.address}
          fromNetwork={fromNetwork}
          toNetwork={toNetwork}
          feesData={feesData}
          closeModal={handleCloseModal}
        />
      )}
    </main>
  )
}
