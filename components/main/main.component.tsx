'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import useTariAccountStore from '@/store/account'

import { ethers } from 'ethers'
import { useAccount, useBalance } from 'wagmi'
import { FaArrowRight } from 'react-icons/fa6'
import { MainComponentProps } from './main.types'
import { Network, NetworkBox } from '@/components/network-box'
import { networks } from '@/utils/networksConfig'
import { MainButton } from '@/components/main-button'
import { BridgeInput } from '@/components/bridge-input'
import { useBridgeInfo } from '@/hooks/use-bridge-info'
import {
  DeployedChains,
  getDeployments,
} from '@tari-project/wxtm-bridge-contracts/deployments'
import { parseToMaxAllowed } from '@/utils/parse-wxtm-token-amount'
import { formatNumber, FormatPreset } from '@/utils/formatters'
import { openExternalLink } from '@/utils/universe'
import { config } from '@/config'
import { useTranslation } from 'react-i18next'
import { TransactionHistory } from '../history/history.component'
import { BridgeForm } from '../bridge-form/bridge-form.component'

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
  isOngoingBridgeTx,
}) => {
  const { t } = useTranslation('main', { useSuspense: false })
  const [openDropdown, setOpenDropdown] = useState<'from' | 'to' | null>(null)

  const { isConnected, chain, address } = useAccount()
  const { fromToken } = useBridgeInfo(fromNetwork)
  const availableBalance = useTariAccountStore((s) => s.availableBalance)

  const chainId = (chain?.id ?? 1) as DeployedChains
  const deployments = getDeployments(chainId)
  const wXTM = deployments.wXTM
  const { data } = useBalance({
    address: address,
    token: wXTM,
  })

  const evm_balance = data?.value
    ? parseFloat(ethers.formatEther(data?.value)).toPrecision(4)
    : '0'
  const isDisabled = chain === undefined || isOngoingBridgeTx

  const fromNetworks = networks.filter(
    (n) => n.name === 'Ethereum' || n.name === 'Tari',
  )
  const [showHistory, setShowHistory] = useState(false)

  const handleNetworkSelect = (network: Network, type: 'from' | 'to') => {
    if (type === 'from') {
      // If selecting same network that's already in "To", swap them
      if (network.name === toNetwork.name) {
        const otherNetwork = fromNetworks.find((n) => n.name !== network.name)

        if (otherNetwork) {
          setFromNetwork(network)
          setToNetwork(otherNetwork)
        }
      } else {
        setFromNetwork(network)
      }
    } else {
      // If selecting same network that's already in "From", swap them
      if (network.name === fromNetwork.name) {
        const otherNetwork = fromNetworks.find((n) => n.name !== network.name)

        if (otherNetwork) {
          setToNetwork(network)
          setFromNetwork(otherNetwork)
        }
      } else {
        setToNetwork(network)
      }
    }
    setOpenDropdown(null)
  }

  const handleMaxAmount = () => {
    const balance = getBalance()
    const parsedRounded = parseToMaxAllowed(balance)
    if (balance && parsedRounded > 0) {
      setValue('amount', parsedRounded.toString(), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      })
    }
  }

  const getBalance = (formatted = false) => {
    return fromNetwork.name === 'Tari'
      ? formatted
        ? formatNumber(availableBalance || 0, FormatPreset.XTM_COMPACT)
        : (availableBalance / 1_000_000).toString()
      : evm_balance
  }

  return (
    <section className="w-[90%] max-w-[83rem] mx-auto">
      <div className="flex flex-col gap-9 gap-small">
        <div className="w-[116px] h-[126.07px] relative">
          <Image
            src="/icons/coin.png"
            fill
            sizes="120px"
            alt="coin icon"
            className="object-cover"
          />
        </div>
        <div className="font-light text-4xl lg:text-[67.64px] text-small leading-[40px] lg:leading-[71.5px] tracking-[0px] lg:tracking-[-3.98px] max-w-[30rem] lg:max-w-[40rem] text-black font-poppins lg:font-normal lg:font-light lg:tracking-[-3.979px]">
          {t('bridge_title_prefix')}{' '}
          <span className="font-semibold">{t('xtm_token')}</span>{' '}
          <span className="hidden short:inline">
            {t('bridge_title_suffix_inline')}
          </span>
          <span className="inline short:hidden">
            {t('bridge_title_suffix_break')}
          </span>
        </div>
        <div className="font-normal text-lg lg:text-[24px] text-very-small leading-[30px] tracking-[0px] lg:tracking-[-1px] max-w-[25rem] lg:max-w-[35rem] whitespace-pre text-black font-poppins lg:text-[27px] lg:leading-[30px] lg:font-normal lg:tracking-[-1px]">
          {t('bridge_description_prefix')}
          <span className="font-semibold">{t('layerzero_oft')}</span>{' '}
          {t('bridge_description_suffix')}
        </div>
      </div>

      <div className="mt-[4rem] mt-small">
        <div
          className="mb-4 flex gap-2"
          style={{
            color: '#000',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '20px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '30px',
            letterSpacing: '-1px',
          }}
        >
          <button
            className={`px-4 py-2 rounded ${
              !showHistory ? 'bg-black text-white' : 'bg-gray-200 text-black'
            }`}
            onClick={() => setShowHistory(false)}
            type="button"
          >
            {t('start_bridging')}
          </button>
          <button
            className={`px-4 py-2 rounded ${
              showHistory ? 'bg-black text-white' : 'bg-gray-200 text-black'
            }`}
            onClick={() => setShowHistory(true)}
            type="button"
          >
            {t('History')}
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
            isOngoingBridgeTx={isOngoingBridgeTx}
          />
        )}
      </div>
      <div className="fixed bottom-0 mb-4 left-0 w-full text-center text-xs text-gray-500 items-center justify-center whitespace-pre-line">
        {t('bridge_one_way_notice')}{' '}
        <a
          onClick={(e) => openExternalLink(config.TARI_BRIDGE_FAQ_URL, e)}
          rel="noopener noreferrer"
          className="underline cursor-pointer"
        >
          {t('see_faq')}
        </a>
        .{' '}
        <a
          onClick={(e) => openExternalLink(config.TARI_SC_AUDIT_URL, e)}
          rel="noopener noreferrer"
          className="underline cursor-pointer"
        >
          {t('view_smart_contract_audit')}
        </a>
        .
      </div>
    </section>
  )
}
