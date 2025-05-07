'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'

import { FaArrowRight } from 'react-icons/fa6'
import { MainComponentProps } from './main.types'
import { Network, NetworkBox } from '../network-box'
import { networks } from '../../utils/networks'
import { MainButton } from '../main-button/main-button'
import { TariToEthInput } from '../tari-to-eth-input'

export const MainComponent: React.FC<MainComponentProps> = ({
  onConnectClick,
  onContinueClick,
  control,
  errors,
  isValid,
  fromNetwork,
  setFromNetwork,
  toNetwork,
  setToNetwork,
}) => {
  const [openDropdown, setOpenDropdown] = useState<'from' | 'to' | null>(null)

  const { isConnected } = useAccount()

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

  /** @dev TODO fetch balances dynamically */
  const getAmount = () => {
    return fromNetwork.name === 'Tari'
      ? (1023451.931).toLocaleString()
      : (328.22).toLocaleString()
  }

  const getAmountTokenSymbol = () => {
    return fromNetwork.name === 'Tari' ? 'XTM' : 'wXTM'
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
        <div className="font-light text-[67.64px] leading-[71.5px] tracking-[-3.98px] max-w-[40rem]">
          Move your XTM with <span className="font-semibold">infinite</span>{' '}
          possibilities
        </div>
        <div className="font-normal text-[27px] leading-[30px] tracking-[-1px] max-w-[35rem]">
          We&apos;ll wrap your XTM allowing you to exchange across any network.
          Powered by <span className="font-semibold">LayerZero</span>
        </div>
      </div>

      <div className="mt-[8rem] mt-shrink">
        <div className="mb-4 font-medium text-xl leading-[30px] tracking-[-1px]">
          Start Bridging
        </div>
        <div className="bg-white/50 backdrop-blur-sm shadow-xl rounded-2xl p-4 mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="w-full flex flex-col p-1">
              <div className="relative">
                <div className="flex items-center">
                  <div className="relative flex gap-[2px] w-full items-stretch">
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

                    {/* Box 3 - Amount */}
                    <div className="flex-1">
                      <div className="flex justify-between gap-2 items-center p-2 px-4 rounded-xl bg-white border border-gray-200">
                        <div className="space-y-[-10px]">
                          <div className="font-medium text-xs text-gray-500">
                            Amount to Bridge
                          </div>
                          <TariToEthInput control={control} errors={errors} />
                        </div>
                        <div className="flex flex-col">
                          <div className="w-fit flex py-2 px-3 bg-gray-200 items-center rounded-3xl justify-center self-end">
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
                              {getAmountTokenSymbol()}
                            </div>
                          </div>
                          <div className="flex justify-end mt-2 gap-1 items-center">
                            <div className="font-semibold text-xs text-gray-500">
                              {getAmount()} {getAmountTokenSymbol()}
                            </div>
                            <div className="border border-gray-500/50 rounded-3xl text-xs font-medium px-1.5">
                              MAX
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow — Between Box 1 and Box 2 */}
                    <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="w-8 h-8 rounded-md border-2 border-gray-300 bg-white flex items-center justify-center shadow-sm">
                        <FaArrowRight className="text-[15px] text-[#171717]" />
                      </div>
                    </div>
                  </div>

                  {!isConnected ? (
                    <MainButton onClick={onConnectClick}>
                      Connect Wallet
                    </MainButton>
                  ) : (
                    <MainButton
                      endIcon={<FaArrowRight />}
                      onClick={onContinueClick}
                      disabled={!isValid}
                    >
                      Continue
                    </MainButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
