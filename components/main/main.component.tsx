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
  isProcessingTransaction,
}) => {
  const [openDropdown, setOpenDropdown] = useState<'from' | 'to' | null>(null)

  const { isConnected, chain, address } = useAccount()
  const { fromToken } = useBridgeInfo(fromNetwork)
  const { available_balance } = useTariAccount()

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
  const isDisabled = chain === undefined || isProcessingTransaction

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
        : available_balance.toLocaleString()
      : evm_balance
  }

  return (
    <section className="w-[90%] max-w-[83rem] mx-auto">
      <div className="flex flex-col gap-9">
        <div className="w-[116px] h-[126.07px] relative">
          <Image
            src="/icons/coin.png"
            fill
            sizes="120px"
            alt="coin icon"
            className="object-cover"
          />
        </div>
        <div className="font-light text-4xl lg:text-[67.64px] leading-[40px] lg:leading-[71.5px] tracking-[0px] lg:tracking-[-3.98px] max-w-[30rem] lg:max-w-[40rem]">
          Bridge your <span className="font-semibold">XTM</span> to <br /> any
          chain
        </div>
        <div className="font-normal text-lg lg:text-[24px] leading-[30px] tracking-[0px] lg:tracking-[-1px] max-w-[25rem] lg:max-w-[35rem] whitespace-pre">
          Wrap XTM to create wXTM on Ethereum. wXTM isn&apos;t your <br />
          everyday Ethereum token anon. It&apos;s a powerful{' '}
          <span className="font-semibold">
            LayerZero <br />
            OFT
          </span>{' '}
          that in future can exist on nearly any chain you desire.
        </div>
      </div>

      <div className="mt-[4rem] mt-shrink">
        <div className="mb-4 font-medium text-xl leading-[30px] tracking-[-1px]">
          Start Bridging
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
                      <div className="mt-small absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="w-8 h-8 rounded-md border-2 border-gray-300 bg-white flex items-center justify-center shadow-sm">
                          <FaArrowRight className="text-[15px] text-[#171717]" />
                        </div>
                      </div>
                    </div>

                    {/* Box 3 - Amount */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center p-2 px-2 2xl:px-4 rounded-xl bg-white border border-gray-200 min-h-[80px] max-h-[80px]">
                        <div className="space-y-[-8px] mr-[-10px]">
                          <div className="font-medium text-xs text-gray-500">
                            Amount to Bridge
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
                                alt={`${fromNetwork.name} icon`}
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
                              MAX
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
                        subText="ETH MAINNET"
                      >
                        Connect Wallet
                      </MainButton>
                    ) : (
                      <MainButton
                        onClick={onContinueClick}
                        disabled={!isValid || isDisabled}
                      >
                        <div className="flex">
                          Continue
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
      <div className="mt-8 text-center text-xs text-gray-500">
        Tari Bridge currently operates one way (XTM to wXTM). Tari contributors
        expect to launch wXTM unwrapping in July 2025 or sooner. <br /> For more
        information about Tari Bridge please{' '}
        <a
          href="https://tarilabs.notion.site/Tari-Universe-Bridge-x-User-Guide-FAQs-2014e6c995c38094b4e4e98a1a3e8ec1"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black underline"
        >
          see our FAQ.
        </a>
      </div>
    </section>
  )
}
