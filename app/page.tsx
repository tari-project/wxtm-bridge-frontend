'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { useForm } from 'react-hook-form'

import { MainModal } from '@/components/modals/main-modal'
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
  const { state } = useConfig()
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

  const { bridgeToEthereum, getBridgeTxParams } = useBridgeToEthereum()
  const { getUserTransactions } = useBridgeTransaction()
  const tariAccount = useTariAccountStore((s) => s.tariAccount)
  const ongoingBridgeTx = useTariAccountStore((s) => s.ongoingBridgeTx)

  useEffect(() => {
    if (isConnected) {
      ;(async () => {
        let serializedState = ''
        console.info(
          '[ TAPPLET-BRIDGE ] session string try to read ',
          isConnected,
        )
        try {
          // Only serialize the state property
          const serializableState = state

          // Custom replacer to handle Maps/Sets in state and avoid cyclic structures
          const getCycleSafeReplacer = () => {
            const seen = new WeakSet()

            return (_key: string, value: any) => {
              if (typeof value === 'function' || typeof value === 'symbol') {
                return undefined
              }

              if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                  return undefined // Avoid cyclic reference
                }
                seen.add(value)

                if (value instanceof Map) {
                  return {
                    __type: 'Map',
                    value: Array.from(value.entries()),
                  }
                }

                if (value instanceof Set) {
                  return {
                    __type: 'Set',
                    value: Array.from(value),
                  }
                }
              }

              return value
            }
          }

          try {
            serializedState = JSON.stringify(
              { state: serializableState, version: 2 },
              getCycleSafeReplacer(),
            )
          } catch (error) {
            console.error(
              '[Page serialize] Failed to serialize config state:',
              error,
            )
          }
        } catch (error) {
          console.error('[Page serialize] Failed to serialize:', error)
        }
        if (serializedState) {
          console.error('[ TAPPLET-BRIDGE ] SEND TO PARENT ', serializedState)
          window.parent.postMessage(
            {
              type: 'REOWN_WALLETCONNECT_CONFIG',
              payload: { config: serializedState },
            },
            '*',
          )
        }
      })()
    }
  }, [isConnected, state])

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
        await getUserTransactions()
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
    } else if (ongoingBridgeTx) {
      setModalStep(2)
      setModalOpen(true)
    }
  }, [isConnected, modalOpen, modalStep, ongoingBridgeTx])

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
      amountAfterFee: feesData.amountAfterFee,
    })
      .then(() => {
        getUserTransactions()
      })
      .catch((error) => {
        console.error('[ TAPPLET-BRIDGE ] Bridge operation failed:', error)
      })
  }, [
    amount,
    ethAddress,
    bridgeToEthereum,
    feesData.amountAfterFee,
    getUserTransactions,
  ])

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
        isOngoingBridgeTx={!!ongoingBridgeTx}
      />
      {modalOpen && (
        <MainModal
          setModalOpen={setModalOpen}
          success={
            ongoingBridgeTx?.status === UserTransactionDTO.status.SUCCESS
          }
          failed={ongoingBridgeTx?.status === UserTransactionDTO.status.TIMEOUT}
          step={modalStep}
          setStep={setModalStep}
          handleBridgeToEthereum={handleBridgeToEthereum}
          handleBridgeToTari={handleBridgeToTari}
          isBridging={!!ongoingBridgeTx}
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
