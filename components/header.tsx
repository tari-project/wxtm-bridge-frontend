'use client'

import Image from 'next/image'
import { useAccount, useChainId } from 'wagmi'
import { chainMap } from '@/utils/chainMap'
import { truncateAddress } from '@/utils/truncate'

type HeaderProps = {
  onConnectClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onConnectClick }) => {
  const chainId = useChainId()
  const { address, isConnected } = useAccount()

  return (
    <header className="absolute top-8 right-8 z-50">
      {!isConnected ? (
        <button
          className="px-8.5 py-4 bg-[#090719] text-white font-semibold text-[12px] rounded-full hover:bg-gray-800 hover:cursor-pointer transition"
          onClick={onConnectClick}
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex p-2 rounded-lg bg-white/25 items-center">
          <div className="w-[24px] h-[24px] rounded-full overflow-hidden relative">
            <Image
              src="/eth.png"
              fill
              sizes="24px"
              alt="Tari icon"
              className="rounded-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <div className="text-[13px] font-semibold">
              {truncateAddress(address ?? '0x', 15)}
            </div>
            <div className="text-[10px] mt-[-5px]">
              {chainMap[chainId] ?? 'Unknown Network'}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
