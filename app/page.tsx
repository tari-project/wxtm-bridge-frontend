'use client'
import React, { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useConnection } from 'wagmi'
import './i18initializer'

import { BridgeFormValues } from '@/components/bridge-input'
import { Header } from '@/components/header'
import { MainComponent } from '@/components/main'
import { MainModal } from '@/components/modals/main-modal'
import { TransactionDetailsModal } from '@/components/modals/transaction-details-modal'
import { useBridgeFees } from '@/hooks/use-bridge-fees'
import { useBridgeToEthereum } from '@/hooks/use-bridge-to-ethereum'

import { useBridgeTransaction } from '@/hooks/use-bridge-transaction'
import useTariAccountStore, { setDetailedTx, setLastOngoingBridgeTx, setTariAccount } from '@/store/account'
import { UserTransactionDTO } from '@tari-project/wxtm-bridge-backend-api'
import { FooterText } from '@/components/main/footer-text'
import useBridgeStore from '@/store/bridge'
import { useFetchDailyLimit } from '@/hooks/use-fetch-daily-limit'
import { setIsModalOpen, setModalStep, useModalStore } from '@/store/modal'

const REFETCH_LIMIT_INTERVAL = 30 * 1000 // 30 sec

export default function Home() {
  const modalStep = useModalStore((s) => s.step)
  const isModalOpen = useModalStore((s) => s.isModalOpen)
  const detailedTx = useTariAccountStore((s) => s.detailedTx)
  const tariAccount = useTariAccountStore((s) => s.tariAccount)
  const ongoingBridgeTx = useTariAccountStore((s) => s.ongoingBridgeTx)
  const tariColdWalletAddress = useBridgeStore((s) => s.tariColdWalletAddress)
  const wrapTokenFeePercentageBps = useBridgeStore((s) => s.wrapTokenFeePercentageBps)
  const fromNetwork = useBridgeStore((s) => s.fromNetwork)

  const fetchDailyLimit = useFetchDailyLimit()
  const { isConnected, address: ethAddress } = useConnection()
  const { getUserBackendBridgeTxs } = useBridgeTransaction()
  const { getBridgeTxParams } = useBridgeToEthereum()
  const methods = useForm<BridgeFormValues>({
    defaultValues: { amount: '' },
    mode: 'onChange',
  })
  const { control, resetField } = methods
  const amount = useWatch({ control, name: 'amount' })

  const [hasFetchedParams, setHasFetchedParams] = useState(false)
  const [isUnwrappingFailed, setIsUnwrappingFailed] = useState(false)
  const [remainingDailyLimit, setRemainingDailyLimit] = useState<number | undefined>(undefined)

  // Prevent main modal from showing when transaction details modal is active
  const showModalDetailedTx = !!detailedTx
  const showModalOngoingTx = ongoingBridgeTx && ongoingBridgeTx.showModal
  const isFailed = ongoingBridgeTx?.status === UserTransactionDTO.status.TIMEOUT || isUnwrappingFailed
  const isWrapSuccess = ongoingBridgeTx?.status === UserTransactionDTO.status.SUCCESS

  const decimals = fromNetwork.name === 'Tari' ? 6 : 18
  const feesData = useBridgeFees(amount, decimals)

  const fetchUserTransactions = useCallback(async () => {
    try {
      await setTariAccount()
      await getUserBackendBridgeTxs()
    } catch (error) {
      console.error('[ TAPPLET-BRIDGE ] Failed to get user transactions:', error)
    }
  }, [getUserBackendBridgeTxs])
  const onNetworkChange = useEffectEvent(() => setRemainingDailyLimit(undefined))
  const onFetchedParams = useEffectEvent((hasFetched: boolean) => setHasFetchedParams(hasFetched))

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

  useEffect(() => {
    const hasFetched = Boolean(!!tariColdWalletAddress?.length || !!wrapTokenFeePercentageBps)
    onFetchedParams(hasFetched)
  }, [tariColdWalletAddress?.length, wrapTokenFeePercentageBps])

  useEffect(() => {
    if (!tariAccount) return
    // Poll every 5 min
    const intervalId = setInterval(fetchUserTransactions, 1000 * 60 * 5)
    void fetchUserTransactions()
    return () => {
      clearInterval(intervalId)
    }
  }, [fetchUserTransactions, tariAccount])

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
      setIsModalOpen(false)
    }
  }, [isModalOpen, ongoingBridgeTx, showModalDetailedTx, showModalOngoingTx])

  useEffect(() => {
    if (fromNetwork.name === 'Tari') {
      onNetworkChange()
      return
    }
    const interval = setInterval(fetchDailyLimit, REFETCH_LIMIT_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchDailyLimit, fromNetwork.name])

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
      <Header />
      <FormProvider {...methods}>
        <MainComponent remainingDailyLimit={remainingDailyLimit} />
        {isModalOpen && !showModalDetailedTx && (
          <MainModal
            success={isWrapSuccess}
            failed={isFailed}
            step={modalStep}
            amount={amount}
            ethereumAddress={ethAddress}
            tariWalletAddress={tariAccount?.address}
            feesData={feesData}
            closeModal={handleCloseModal}
            type={ongoingBridgeTx?.type || 'wrap'}
          />
        )}
      </FormProvider>
      {detailedTx && <TransactionDetailsModal transaction={detailedTx} closeModal={() => setDetailedTx(null)} />}
      <FooterText />
    </main>
  )
}
