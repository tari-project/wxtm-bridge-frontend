'use client'

import React from 'react'
import Image from 'next/image'
import Button from './button'
import { useAccount, useChainId } from 'wagmi'
import { IoCloseOutline } from 'react-icons/io5'
import { FaEthereum } from 'react-icons/fa'
import { FaArrowRight } from 'react-icons/fa6'
import { truncateAddress } from '@/utils/truncate'

type BridgeModalProps = {
  closeModal: () => void
  goToNextStep: () => void
}

const BridgeModal: React.FC<BridgeModalProps> = ({
  closeModal,
  goToNextStep,
}) => {
  const chainId = useChainId()
  const { address } = useAccount()

  const chainMap: Record<number, string> = {
    1: 'ETH MAINNET',
    11155111: 'SEPOLIA',
    84532: 'BASE SEPOLIA',
  }

  return (
    <div className="w-full flex flex-col p-5">
      <div className="mt-2">
        {/* Top Section */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2 text-base">
            <div className="text-white px-[7px] py-[1px] font-semibold bg-black rounded-full">
              Bridge
            </div>
            <div className="font-semibold">Buy</div>
          </div>

          <button
            className="text-black font-bold hover:cursor-pointer
                 cursor-pointer flex text-xl rounded-full p-1 bg-black/10 hover:bg-black/20"
            onClick={closeModal}
          >
            <IoCloseOutline />
          </button>
        </div>

        {/* Section 1 */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex flex-col">
            <div className="font-semibold text-lg">Enter amount</div>
            <div className="text-xs mt-[-4px]">
              Step <span className="font-semibold">1</span>/2
            </div>
          </div>
          <div className="flex gap-2 p-2 rounded-lg bg-white/25">
            <FaEthereum className="text-2xl text-[#7160EE]" />

            <div className="flex flex-col">
              <div className="text-[13px] font-semibold">
                {truncateAddress(address ?? '0x', 15)}
              </div>
              <div className="text-[10px] mt-[-5px]">
                {chainMap[chainId] ?? 'Unknown Network'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="relative mt-4">
          <div className="flex gap-1">
            <div className="flex flex-1 gap-3 items-center p-2 px-4 rounded-lg bg-white border border-gray-200">
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
            </div>

            <div className="flex flex-1 gap-3 items-center p-2 px-4 rounded-lg bg-white border border-gray-200">
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
          </div>

          {/* Arrow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-6 h-6 rounded-md border-2 border-gray-300 bg-white flex items-center justify-center shadow-sm">
              <FaArrowRight className="text-[10px] text-[#171717]" />
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="flex justify-between gap-2 mt-1 items-center p-4 rounded-lg bg-white border-[1px] border-gray-200 max-w-[421px]">
          <div className="space-y-[-10px]">
            <div className="font-medium text-[32px]">
              {(1000).toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-500">
              {(1023451.931).toLocaleString()} XTM
            </div>
          </div>

          <div>
            <div className="flex py-[5px] px-[10px] bg-[#E5E2E1] items-center rounded-3xl justify-center">
              <div className="w-[27.5px] h-[27.5px] rounded-full overflow-hidden ml-[-3px] mr-2 relative">
                <Image
                  src="/icons/tari.png"
                  fill
                  sizes="38px"
                  alt="Picture of the author"
                  className="rounded-full object-cover"
                />
              </div>
              <div className="font-bold text-sm">XTM</div>
            </div>
            <div className="flex justify-end mt-2">
              <div className="border-[1.5px] border-gray-500/50 rounded-3xl text-[8px] font-medium px-1.5 py-0.1">
                MAX
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="flex flex-col mt-1 p-4 rounded-lg bg-white border-[1px] border-gray-200 max-w-[421px] mb-4">
          <div className="text-gray-500 text-xs font-medium">You will get</div>

          <div className="flex gap-2">
            <div className="relative w-[38px] h-[38px] mt-3">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <Image
                  src="/icons/eth.png"
                  fill
                  sizes="38px"
                  alt="ETH icon"
                  className="rounded-full object-cover"
                />
              </div>

              <div className="absolute top-[-3px] right-[-3px] w-[18px] h-[18px] rounded-full overflow-hidden border-2 border-white">
                <Image
                  src="/icons/tari.png"
                  fill
                  sizes="18px"
                  alt="Tari icon"
                  className="rounded-full object-cover"
                />
              </div>
            </div>
            <div className="">
              <div className="font-semibold text-[32px]">998.2 wXTM</div>
              <div className="text-gray-500 text-xs font-medium mt-[-12px]">
                $2000.12
              </div>
            </div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-200 mt-3 mb-2"></div>

          <div className="flex justify-between">
            <div className="text-gray-500 text-xs font-medium">
              <div>Rate</div>
              <div>Bridge Fee</div>
              <div>Est. Gas</div>
              <div>Duration</div>
            </div>

            <div className="text-right text-gray-500 text-xs font-medium">
              <div>1000</div>
              <div>0.02%</div>
              <div>8.12</div>
              <div>Up to 24h</div>
            </div>
          </div>

          <div className="mt-2 text-gray-500 text-xs font-medium">
            Your funds will be automatically deposited into your Tari Universe
            wallet.
          </div>
        </div>

        {/* Button */}
        <Button
          label="Continue to Confirmation"
          onClick={goToNextStep}
          disabled={false}
        />

        {/* Legend */}
        <div className="text-xs font-medium text-gray-500 text-center mt-4 mb-2">
          Powered by LayerZero
        </div>
      </div>
    </div>
  )
}

export default BridgeModal
