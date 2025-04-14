'use client'

import Image from 'next/image'
import { useAccount, useChainId } from 'wagmi'
import { IoCloseOutline } from 'react-icons/io5'
import { FaEthereum } from 'react-icons/fa'
import { truncateAddress } from '@/utils/truncate'

interface BridgeModalProps {
  closeModal: () => void
}

const BridgeModal: React.FC<BridgeModalProps> = ({ closeModal }) => {
  const chainId = useChainId()
  const { address } = useAccount()

  const chainMap: Record<number, string> = {
    1: 'ETH MAINNET',
    11155111: 'SEPOLIA',
    84532: 'BASE SEPOLIA',
  }

  return (
    <div className="w-full flex flex-col p-5">
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="text-white px-[6px] py-[1px] font-bold bg-black rounded-full">
            Bridge
          </div>
          <div className="font-bold">Buy</div>
        </div>

        <button
          className="text-black font-bold hover:cursor-pointer
                absolute top-4 right-4 cursor-pointer flex text-xl rounded-full p-1 bg-black/10 hover:bg-black/20"
          onClick={closeModal}
        >
          <IoCloseOutline />
        </button>
      </div>

      {/* Section 1 */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex flex-col">
          <div className="font-bold">Enter amount</div>
          <div className="text-xs">
            Step <span className="font-bold">1</span>/2
          </div>
        </div>
        <div className="flex gap-2 p-2 rounded-lg bg-white/25">
          <FaEthereum className="text-2xl text-[#7160EE]" />

          <div className="flex flex-col">
            <div className="text-sm font-semibold">
              {truncateAddress(address ?? '0x', 15)}
            </div>
            <div className="text-xs mt-[-5px]">
              {chainMap[chainId] ?? 'Unknown Network'}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="flex justify-between mt-4">
        <div className="flex gap-3 items-center p-1 pl-3 pr-24 rounded-lg bg-white border-[1px] border-gray-200">
          <div className="w-[38px] h-[38px] rounded-full overflow-hidden">
            <Image
              src="/icons/tari.png"
              width={38}
              height={38}
              alt="Picture of the author"
              className="rounded-full object-cover"
            />
          </div>

          <div className="text-gray-500 flex flex-col text-xs">
            <div>From</div>
            <div className="text-base text-[#171717] font-bold my-[-4px]">
              XTM
            </div>
            <div>Tari</div>
          </div>
        </div>

        <div className="flex gap-2 items-center p-1 pl-3 pr-24 rounded-lg bg-white border-[1px] border-gray-200">
          <div className="w-[38px] h-[38px] rounded-full overflow-hidden">
            <Image
              src="/icons/eth.png"
              width={38}
              height={38}
              alt="Picture of the author"
              className="rounded-full object-cover"
            />
          </div>

          <div className="text-gray-500 flex flex-col text-xs">
            <div>To</div>
            <div className="text-base text-[#171717] font-bold my-[-4px]">
              wXTM
            </div>
            <div>Ethereum</div>
          </div>
        </div>
      </div>

      {/* Section 3 */}
      <div className="flex justify-between gap-2 mt-1 items-center p-2 rounded-lg bg-white border-[1px] border-gray-200 max-w-[421px]">
        <div>
          <div>1000</div>
          <div>1023451.931 XTM</div>
        </div>

        <div>
          <div className="flex">
            <div className="w-[38px] h-[38px] rounded-full overflow-hidden">
              <Image
                src="/icons/tari.png"
                width={38}
                height={38}
                alt="Picture of the author"
                className="rounded-full object-cover"
              />
            </div>
            <div>XTM</div>
          </div>
          <div>MAX</div>
        </div>
      </div>

      {/* Section 4 */}

      {/* Button */}

      {/* Legend */}

      <div className="mt-20">content</div>
    </div>
  )
}

export default BridgeModal
