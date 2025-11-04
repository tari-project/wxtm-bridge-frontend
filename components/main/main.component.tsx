'use client'

import React, { useState } from 'react'

import { MainComponentProps } from './main.types'
import { useTranslation } from 'react-i18next'
import { TransactionHistory } from '../history/history.component'
import { BridgeForm } from '../bridge-form/bridge-form.component'
import { HomeText } from './home-text'
import useTariAccountStore from '@/store/account'
import { FooterText } from './footer-text'
import { useBridgeStatus } from '@/hooks/use-bridge-status'

export const MainComponent: React.FC<MainComponentProps> = ({
  onConnectClick,
  onContinueClick,
  control,
  errors,
  setValue,
  isValid,
  fromNetwork,
  setFromNetwork,
  toNetwork,
  setToNetwork,
}) => {
  const { t } = useTranslation('main', { useSuspense: false })
  const [showHistory, setShowHistory] = useState(false)
  const bridgeTxs = useTariAccountStore((s) => s.combinedBridgeTxs)

  const { isOffline } = useBridgeStatus()

  const offlineMarkup = (
    <header className="mt-[4rem] mt-small z-50 flex items-center w-fill  mx-auto">
      <div className="flex flex-col gap-1 items-center p-5 w-full rounded-xl bg-white/30 backdrop-blur-md">
        <div className="font-semibold text-center leading-none text-xl text-black font-poppins flex">
          The bridge is currently down for maintenance.
        </div>
        <div className="font-medium text-center leading-none text-lg text-black font-poppins  flex">
          We&#39;ll be back up and running soon! Thanks for your patience!
        </div>
      </div>
    </header>
  )

  return (
    <section className="w-[90%] max-w-[83rem] mx-auto">
      <HomeText />

      {!isOffline ? (
        <div className="mt-[4rem] mt-small">
          <div
            className="mb-4 flex gap-2"
            style={{
              color: '#000',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: 510,
              lineHeight: '30px',
              letterSpacing: '-1px',
            }}
          >
            <button
              className={`${!showHistory ? 'text-black' : 'text-[#797979] hover:cursor-pointer'}`}
              onClick={() => setShowHistory(false)}
              type="button"
            >
              {t('start_bridging')}
            </button>
            <span className="text-black"> | </span>
            <button
              className={`${showHistory ? 'text-black' : 'text-[#797979] hover:cursor-pointer'}`}
              onClick={() => setShowHistory(true)}
              type="button"
            >
              {t('history')} ({bridgeTxs.length})
            </button>
          </div>

          {showHistory ? (
            <TransactionHistory />
          ) : (
            <BridgeForm
              onConnectClick={onConnectClick}
              onContinueClick={onContinueClick}
              control={control}
              errors={errors}
              setValue={setValue}
              isValid={isValid}
              fromNetwork={fromNetwork}
              setFromNetwork={setFromNetwork}
              toNetwork={toNetwork}
              setToNetwork={setToNetwork}
            />
          )}
        </div>
      ) : (
        offlineMarkup
      )}
      <FooterText />
    </section>
  )
}
