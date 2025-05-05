'use client'

import React from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'

import { FaArrowRight } from 'react-icons/fa6'
import { MainComponentProps } from './main.types'

export const MainComponent: React.FC<MainComponentProps> = ({
  onConnectClick,
  onContinueClick,
  register,
}) => {
  const { isConnected } = useAccount()

  return (
    <section className="w-[90%] max-w-[83rem] mx-auto mt-40">
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

      <div className="mt-[8rem]">
        <div className="mb-4 font-medium text-xl leading-[30px] tracking-[-1px]">
          Start Bridging
        </div>
        <div className="bg-white/50 backdrop-blur-sm shadow-xl rounded-2xl p-4 mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="w-full flex flex-col p-1">
              <div className="relative">
                <div className="flex items-center">
                  <div className="flex gap-[2px] w-full">
                    {/* Box 1 */}
                    <div className="flex flex-1 gap-3 items-center p-2 px-4 rounded-xl bg-white border border-gray-200 relative">
                      <div className="w-[38px] h-[38px] rounded-full overflow-hidden relative">
                        <Image
                          src="/icons/tari.png"
                          fill
                          sizes="38px"
                          alt="Tari icon"
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="text-gray-500 flex flex-col text-xs font-medium">
                        <div>From</div>
                        <div className="text-xl text-[#171717] font-bold my-[-4px]">
                          XTM
                        </div>
                        <div>Tari</div>
                      </div>

                      {/* Arrow - positioned between box 1 and 2 */}
                      <div className="absolute top-1/2 right-0 translate-x-10/18 -translate-y-1/2 z-10">
                        <div className="w-8 h-8 rounded-md border-2 border-gray-300 bg-white flex items-center justify-center shadow-sm">
                          <FaArrowRight className="text-[15px] text-[#171717]" />
                        </div>
                      </div>
                    </div>

                    {/* Box 2 */}
                    <div className="flex flex-1 gap-3 items-center p-2 px-4 rounded-xl bg-white border border-gray-200">
                      <div className="w-[38px] h-[38px] rounded-full overflow-hidden relative">
                        <Image
                          src="/icons/eth.png"
                          fill
                          sizes="38px"
                          alt="ETH icon"
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="text-gray-500 flex flex-col text-xs font-medium">
                        <div>To</div>
                        <div className="text-xl text-[#171717] font-bold my-[-4px]">
                          wXTM
                        </div>
                        <div>Ethereum</div>
                      </div>
                    </div>

                    {/* Box 3 */}
                    <div className="flex flex-1 justify-between gap-2 items-center p-2 px-4 rounded-xl bg-white border border-gray-200">
                      <div className="space-y-[-10px]">
                        <div className="font-medium text-xs text-gray-500">
                          Amount to Bridge
                        </div>

                        <input
                          {...register('amount')}
                          type="number"
                          className="font-medium text-[32px] outline-none bg-transparent border-none w-[130px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>

                      <div className="flex flex-col">
                        <div className="w-fit flex py-2 px-3 bg-gray-200 items-center rounded-3xl justify-center self-end">
                          <div className="w-5 h-5 rounded-full overflow-hidden -ml-1 mr-2 relative">
                            <Image
                              src="/icons/tari.png"
                              fill
                              sizes="20px"
                              alt="Tari icon"
                              className="rounded-full object-cover"
                            />
                          </div>
                          <div className="font-bold text-[12.85px]">XTM</div>
                        </div>

                        <div className="flex justify-end mt-2 gap-1 items-center">
                          <div className="font-semibold text-xs text-gray-500">
                            {(1023451.931).toLocaleString()} XTM
                          </div>
                          <div className="border border-gray-500/50 rounded-3xl text-xs font-medium px-1.5">
                            MAX
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  {!isConnected ? (
                    <button
                      className="flex items-center justify-center ml-6 bg-[#090719] text-white rounded-xl p-6 px-8 h-full font-semibold hover:bg-gray-900 transition gap-2
                      whitespace-nowrap hover:cursor-pointer"
                      onClick={onConnectClick}
                    >
                      Connect Wallet
                    </button>
                  ) : (
                    <button
                      className="flex items-center justify-center ml-6 bg-[#090719] text-white rounded-xl p-6 px-6 h-full font-semibold hover:bg-gray-900 transition gap-2 hover:cursor-pointer"
                      onClick={onContinueClick}
                    >
                      <span className="font-semibold text-lg">Continue</span>
                      <FaArrowRight />
                    </button>
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
