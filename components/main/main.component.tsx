'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import useTariAccount from '@/store/account'

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
  const available_balance = useTariAccount((s) => s.available_balance)

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
        ? formatNumber(available_balance || 0, FormatPreset.XTM_COMPACT)
        : (available_balance / 1_000_000).toString()
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
          className="mb-4"
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
          {t('start_bridging')}
        </div>
        <div className="bg-white/50 backdrop-blur-sm shadow-xl rounded-2xl p-4 mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="w-full flex flex-col p-1">
              <div className="relative">
                <div className="flex items-center justify-center">
                  <div className="relative flex gap-[2px] w-full items-stretch">
                    {/* Wrap Box 1 and Box 2 in a relative container for precise arrow positioning */}
                    <div className="relative flex flex-[2] gap-[2px]">
                      {/* Box 1 - From */}
                      <div className="flex-1">
                        <NetworkBox
                          type="from"
                          selected={fromNetwork}
                          isOpen={openDropdown === 'from'}
                          networks={fromNetworks}
                          onToggle={() =>
                            setOpenDropdown(
                              openDropdown === 'from' ? null : 'from',
                            )
                          }
                          onSelect={(network) =>
                            handleNetworkSelect(network, 'from')
                          }
                        />
                      </div>

                      {/* Box 2 - To */}
                      <div className="flex-1">
                        <NetworkBox
                          type="to"
                          selected={toNetwork}
                          isOpen={openDropdown === 'to'}
                          networks={networks}
                          onToggle={() =>
                            setOpenDropdown(openDropdown === 'to' ? null : 'to')
                          }
                          onSelect={(network) =>
                            handleNetworkSelect(network, 'to')
                          }
                          fromNetwork={fromNetwork}
                        />
                      </div>

                      {/* Arrow — Between Box 1 and Box 2 */}
                      <div className="this-hide absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="w-8 h-8 rounded-md border-2 border-gray-300 bg-white flex items-center justify-center shadow-sm">
                          <FaArrowRight className="text-[15px] text-[#171717]" />
                        </div>
                      </div>
                    </div>

                    {/* Box 3 - Amount */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center p-2 px-2 2xl:px-4 rounded-xl bg-white border border-gray-200 min-h-[90px] max-h-[90px]">
                        <div className="space-y-[-8px] mr-[-10px]">
                          <div className="font-medium text-xs text-gray-500">
                            {t('amount_to_bridge')}
                          </div>
                          <BridgeInput
                            fromNetwork={fromNetwork}
                            control={control}
                            errors={errors}
                          />
                        </div>
                        <div className="hidden lg:flex flex-col">
                          <div className="w-fit flex py-1 2xl:py-2 px-3 bg-gray-200 items-center rounded-3xl justify-center self-end">
                            <div className="w-5 h-5 rounded-full overflow-hidden -ml-1 mr-2 relative">
                              <Image
                                src={fromNetwork.icon}
                                fill
                                sizes="20px"
                                alt={t('network_icon_alt', {
                                  network: fromNetwork.name,
                                })}
                                className="rounded-full object-cover"
                              />
                            </div>
                            <div className="font-bold text-[12.85px]">
                              {fromToken}
                            </div>
                          </div>
                          <div className="flex justify-end mt-2 gap-1 items-center">
                            <div className="font-semibold text-[9px] 2xl:text-xs text-gray-500">
                              {getBalance(true)} {fromToken}
                            </div>
                            <button
                              className="border border-gray-500/50 rounded-3xl text-xs font-medium px-1.5 hover:cursor-pointer"
                              onClick={handleMaxAmount}
                            >
                              {t('max')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    {!isConnected ? (
                      <MainButton
                        onClick={onConnectClick}
                        subText={t('eth_mainnet')}
                      >
                        {t('connect_wallet')}
                      </MainButton>
                    ) : (
                      <MainButton
                        onClick={onContinueClick}
                        disabled={!isValid || isDisabled}
                      >
                        <div className="flex">
                          {t('continue')}
                          <FaArrowRight className="ml-2" />
                        </div>
                      </MainButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
