'use client'

import React, { useState } from 'react'

import { MainComponentProps } from './main.types'
import { openExternalLink } from '@/utils/universe'
import { config } from '@/config'
import { useTranslation } from 'react-i18next'
import { TransactionHistory } from '../history/history.component'
import { BridgeForm } from '../bridge-form/bridge-form.component'
import { HomeText } from './home-text'
import useTariAccountStore from '@/store/account'

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
  const bridgeTxs = useTariAccountStore((s) => s.backendBridgeTxs)

  return (
    <section className="w-[90%] max-w-[83rem] mx-auto">
      <HomeText />

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
            className={`${
              !showHistory
                ? 'text-black'
                : 'text-[#797979] hover:cursor-pointer'
            }`}
            onClick={() => setShowHistory(false)}
            type="button"
          >
            {t('start_bridging')}
          </button>
          <span className="text-black"> | </span>
          <button
            className={`${
              showHistory ? 'text-black' : 'text-[#797979] hover:cursor-pointer'
            }`}
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
      <div className="fixed bottom-0 mb-4 left-0 w-full text-center text-xs text-black/50 items-center justify-center whitespace-pre-line leading-[200%]">
        {t('bridge_one_way_notice')}{' '}
        <a
          onClick={(e) => openExternalLink(config.TARI_BRIDGE_FAQ_URL, e)}
          rel="noopener noreferrer"
          className="underline cursor-pointer font-normal text-black mt-2"
        >
          {t('see_faq')}
        </a>
        <span className="text-black"> | </span>
        <a
          onClick={(e) => openExternalLink(config.TARI_SC_AUDIT_URL, e)}
          rel="noopener noreferrer"
          className="underline cursor-pointer font-normal text-black"
        >
          {t('view_smart_contract_audit')}
        </a>
        .
      </div>
    </section>
  )
}
