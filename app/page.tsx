'use client'
import React, { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useConnection } from 'wagmi'
import './i18initializer'

import { BridgeFormValues } from '@/components/bridge-input'
import { Header } from '@/components/header'
import { MainComponent } from '@/components/main'
import { MainModal } from '@/components/modals/main-modal'
import { TransactionDetailsModal } from '@/components/modals/transaction-details-modal'
import { Network } from '@/components/network-box'
import { useBridgeFees } from '@/hooks/use-bridge-fees'
import { useBridgeToEthereum } from '@/hooks/use-bridge-to-ethereum'
import { useBridgeToTari } from '@/hooks/use-bridge-to-tari'
import { useBridgeTransaction } from '@/hooks/use-bridge-transaction'
import useTariAccountStore, { setDetailedTx, setLastOngoingBridgeTx, setTariAccount } from '@/store/account'
import { UserTransactionDTO } from '@tari-project/wxtm-bridge-backend-api'
import { type DeployedChains } from '@/types/contracts'
import { FooterText } from '@/components/main/footer-text'
import useBridgeStore from '@/store/bridge'
import { useFetchDailyLimit } from '@/hooks/use-fetch-daily-limit'
import { setIsModalOpen, setModalStep, useModalStore } from '@/store/modal'

const REFETCH_LIMIT_INTERVAL = 30 * 1000 // 30 sec

export default function Home() {
  const { isConnected, chain, address: ethAddress } = useConnection()
  const [hasFetchedParams, setHasFetchedParams] = useState(false)
  const modalStep = useModalStore((s) => s.step)
  const isModalOpen = useModalStore((s) => s.isModalOpen)
  const [fromNetwork, setFromNetwork] = useState<Network>({
    name: 'Tari',
    icon: '/icons/tari.png',
  })
  const [toNetwork, setToNetwork] = useState<Network>({
    name: 'Ethereum',
    icon: '/icons/eth.png',
  })
  const [isUnwrappingFailed, setIsUnwrappingFailed] = useState(false)
  const [remainingDailyLimit, setRemainingDailyLimit] = useState<number | undefined>(undefined)

  const fetchDailyLimit = useFetchDailyLimit()

  const chainId = (chain?.id ?? 1) as DeployedChains

  const { getBridgeTxParams } = useBridgeToEthereum()
  const { isSuccess } = useBridgeToTari(ethAddress || '0x', chainId)
  const { getUserBackendBridgeTxs } = useBridgeTransaction()
  const tariAccount = useTariAccountStore((s) => s.tariAccount)

  const detailedTx = useTariAccountStore((s) => s.detailedTx)
  const ongoingBridgeTx = useTariAccountStore((s) => s.ongoingBridgeTx)

  const tariColdWalletAddress = useBridgeStore((s) => s.tariColdWalletAddress)
  const wrapTokenFeePercentageBps = useBridgeStore((s) => s.wrapTokenFeePercentageBps)

  // Prevent main modal from showing when transaction details modal is active
  const showModalDetailedTx = !!detailedTx
  const showModalOngoingTx = ongoingBridgeTx && ongoingBridgeTx.showModal

  const isFailed = ongoingBridgeTx?.status === UserTransactionDTO.status.TIMEOUT || isUnwrappingFailed
  const isWrapSuccess = ongoingBridgeTx?.status === UserTransactionDTO.status.SUCCESS

  const {
    control,
    setValue,
    formState: { errors, isValid },
    resetField,
  } = useForm<BridgeFormValues>({
    defaultValues: { amount: '' },
    mode: 'onChange',
  })

  const amount = useWatch({ control, name: 'amount' })

  const decimals = fromNetwork.name === 'Tari' ? 6 : 18
  const feesData = useBridgeFees(amount, decimals)

  useEffect(() => {
    if (!tariAccount || hasFetchedParams) return
    const fetchBridgeTxParams = async () => {
      try {
        await getBridgeTxParams()
      } catch (error) {
        console.error('[ TAPPLET-BRIDGE ] Failed to get bridge transaction params:', error)
      }
    }

    fetchBridgeTxParams().then(() => {
      setHasFetchedParams(true)
    })
  }, [getBridgeTxParams, hasFetchedParams, tariAccount])

  const onFetchedParams = useEffectEvent((hasFetched: boolean) => setHasFetchedParams(hasFetched))
  useEffect(() => {
    const hasFetched = Boolean(!!tariColdWalletAddress?.length || !!wrapTokenFeePercentageBps)
    onFetchedParams(hasFetched)
  }, [tariColdWalletAddress?.length, wrapTokenFeePercentageBps])

  const fetchUserTransactions = useCallback(async () => {
    try {
      await getUserBackendBridgeTxs()
      await setTariAccount()
    } catch (error) {
      console.error('[ TAPPLET-BRIDGE ] Failed to get user transactions:', error)
    }
  }, [getUserBackendBridgeTxs])

  useEffect(() => {
    if (!tariAccount) return
    // Poll every 5 min
    const intervalId = setInterval(fetchUserTransactions, 1000 * 60 * 5)
    return () => {
      clearInterval(intervalId)
    }
  }, [fetchUserTransactions, tariAccount])

  const onModalStateChange = useEffectEvent((open: boolean, step?: number) => {
    setIsModalOpen(open)
    if (step) {
      setModalStep(step)
    }
  })

  useEffect(() => {
    if (isModalOpen && modalStep === 0 && isConnected) {
      setIsModalOpen(false)
      setModalStep(1)
      return
    }
  }, [isConnected, isModalOpen, modalStep])

  useEffect(() => {
    if (!showModalDetailedTx) {
      if (showModalOngoingTx && ongoingBridgeTx.type === 'wrap') {
        setIsModalOpen(true)
        setModalStep(2)
      }
    } else if (showModalDetailedTx && isModalOpen) {
      onModalStateChange(false)
    }
  }, [isModalOpen, isSuccess, ongoingBridgeTx, showModalDetailedTx, showModalOngoingTx])

  const onNetworkChange = useEffectEvent(() => setRemainingDailyLimit(undefined))
  useEffect(() => {
    if (fromNetwork.name === 'Tari') {
      onNetworkChange()
      return
    }
    const interval = setInterval(fetchDailyLimit, REFETCH_LIMIT_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchDailyLimit, fromNetwork.name])

  const handleConnectClick = () => {
    if (!isConnected) {
      setModalStep(0)
      setIsModalOpen(true)
    }
  }
  const handleContinueClick = () => {
    setModalStep(1)
    setIsModalOpen(true)
  }
  const handleSetOngoingModalOpen = (open: boolean) => {
    setIsModalOpen(open)
    if (ongoingBridgeTx) setLastOngoingBridgeTx({ ...ongoingBridgeTx, showModal: false })
  }
  const handleCloseModal = () => {
    resetField('amount', { defaultValue: '' })
    setIsUnwrappingFailed(false)
    handleSetOngoingModalOpen(false)
    setModalStep(1)
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col pl-(--tu-padding-left) pr-8 items-center justify-center">
      <Header onConnectClickAction={handleConnectClick} />

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
        remainingDailyLimit={remainingDailyLimit}
      />

      {detailedTx && <TransactionDetailsModal transaction={detailedTx} closeModal={() => setDetailedTx(null)} />}

      {isModalOpen && !showModalDetailedTx && (
        <MainModal
          success={isWrapSuccess}
          failed={isFailed}
          step={modalStep}
          amount={amount}
          ethereumAddress={ethAddress}
          tariWalletAddress={tariAccount?.address}
          fromNetwork={fromNetwork}
          toNetwork={toNetwork}
          feesData={feesData}
          closeModal={handleCloseModal}
          type={ongoingBridgeTx?.type || 'wrap'}
        />
      )}
      <FooterText />
    </main>
  )
}
