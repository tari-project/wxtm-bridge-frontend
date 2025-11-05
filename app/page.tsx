'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAccount } from 'wagmi'
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
import useTariAccountStore from '@/store/account'
import { UserTransactionDTO } from '@tari-project/wxtm-bridge-backend-api'
import { DeployedChains } from '@tari-project/wxtm-bridge-contracts/deployments'
import { FooterText } from '@/components/main/footer-text'

const DAILY_LIMIT_ERROR = 'Daily wrap limit exceeded'
const DAILY_LIMIT_ERROR_TYPE = 'Forbidden'

export default function Home() {
  const { isConnected, chain, address: ethAddress } = useAccount()
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
  const [isUnwrapping, setIsUnwrapping] = useState(false)
  const [isUnwrappingFailed, setIsUnwrappingFailed] = useState(false)

  const chainId = (chain?.id ?? 1) as DeployedChains

  const { bridgeToEthereum, getBridgeTxParams } = useBridgeToEthereum()
  const { bridgeToTari, isPending, isSuccess, isError, error } = useBridgeToTari(ethAddress || '0x', chainId)
  const { getUserBackendBridgeTxs } = useBridgeTransaction()
  const tariAccount = useTariAccountStore((s) => s.tariAccount)
  const setExceededDailyLimit = useTariAccountStore((s) => s.setExceededDailyLimit)
  const setTariAccount = useTariAccountStore((s) => s.setTariAccount)
  const detailedTx = useTariAccountStore((s) => s.detailedTx)
  const setDetailedTx = useTariAccountStore((s) => s.setDetailedTx)
  const ongoingBridgeTx = useTariAccountStore((s) => s.ongoingBridgeTx)
  const setLastOngoingBridgeTx = useTariAccountStore((s) => s.setLastOngoingBridgeTx)

  // Prevent main modal from showing when transaction details modal is active
  const showModalDetailedTx = !!detailedTx
  const showModalOngoingTx = ongoingBridgeTx && ongoingBridgeTx.showModal

  const isFailed = ongoingBridgeTx?.status === UserTransactionDTO.status.TIMEOUT || isUnwrappingFailed
  const isWrapSuccess = ongoingBridgeTx?.status === UserTransactionDTO.status.SUCCESS

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
  const decimals = fromNetwork.name === 'Tari' ? 6 : 18
  const feesData = useBridgeFees(amount, decimals)

  const fetchBridgeTxParams = useCallback(async () => {
    try {
      await getBridgeTxParams()
    } catch (error) {
      console.error('[ TAPPLET-BRIDGE ] Failed to get bridge transaction params:', error)
    }
  }, [getBridgeTxParams])

  useEffect(() => {
    if (!tariAccount) return
    void fetchBridgeTxParams()
  }, [fetchBridgeTxParams, tariAccount])

  useEffect(() => {
    if (!tariAccount) return

    const fetchUserTransactions = async () => {
      try {
        await getUserBackendBridgeTxs()
        await setTariAccount()
      } catch (error) {
        console.error('[ TAPPLET-BRIDGE ] Failed to get user transactions:', error)
      }
    }

    fetchUserTransactions()
    // Poll every 30 sec
    const intervalId = setInterval(fetchUserTransactions, 30000)

    return () => {
      clearInterval(intervalId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tariAccount?.address])

  useEffect(() => {
    if (modalOpen && modalStep === 0 && isConnected) {
      setModalOpen(false)
      setModalStep(1)
    } else if (!showModalDetailedTx && showModalOngoingTx && (isSuccess || ongoingBridgeTx.type === 'wrap')) {
      setModalStep(2)
      setModalOpen(true)
    } else if (showModalDetailedTx && modalOpen) {
      setModalOpen(false)
    }
  }, [isConnected, modalOpen, modalStep, isSuccess, ongoingBridgeTx, showModalDetailedTx, showModalOngoingTx])

  useEffect(() => {
    if (isUnwrapping) {
      console.debug(`[ TAPPLET-BRIDGE ] Initiating transaction...`)
      setModalStep(3)
    }
  }, [isUnwrapping])

  useEffect(() => {
    if (isSuccess) {
      console.debug(`[ TAPPLET-BRIDGE ] Unwrap transaction success!`)
      setIsUnwrapping(false)
      setModalStep(2)
    } else if (isError) {
      console.error(`[ TAPPLET-BRIDGE ] Unwrap transaction failed:`, error)
      setIsUnwrapping(false)
      setIsUnwrappingFailed(true)
    }
  }, [isPending, isSuccess, isError, error])

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
    if (ongoingBridgeTx) setLastOngoingBridgeTx({ ...ongoingBridgeTx, showModal: false })
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
      .then(async () => {
        await getUserBackendBridgeTxs()
      })
      .catch((e) => {
        console.error('[ TAPPLET-BRIDGE ] Bridge operation failed:', e)
        const error = e as Error
        const isLimitError =
          error?.message?.includes(DAILY_LIMIT_ERROR_TYPE) || error?.message?.includes(DAILY_LIMIT_ERROR)
        setExceededDailyLimit(isLimitError)
        if (isLimitError) {
          setModalOpen(false)
        }
      })
  }, [amount, ethAddress, bridgeToEthereum, feesData.amountAfterFee, getUserBackendBridgeTxs, setExceededDailyLimit])

  const handleBridgeToTari = useCallback(async () => {
    if (!amount || !ethAddress || !tariAccount?.address) {
      return
    }

    setIsUnwrapping(true)
    const success = await bridgeToTari(amount, ethAddress, tariAccount.address)
    if (success) {
      setIsUnwrapping(false)
    } else {
      setIsUnwrapping(false)
      setIsUnwrappingFailed(true)
    }
  }, [amount, ethAddress, tariAccount?.address, bridgeToTari])

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
      />

      {detailedTx && <TransactionDetailsModal transaction={detailedTx} closeModal={() => setDetailedTx(null)} />}

      {modalOpen && !showModalDetailedTx && (
        <MainModal
          success={isWrapSuccess}
          failed={isFailed}
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
          type={ongoingBridgeTx?.type || 'wrap'}
        />
      )}
      <FooterText />
    </main>
  )
}
