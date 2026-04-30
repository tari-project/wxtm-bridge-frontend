'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAccount, useChainId, useConnect } from 'wagmi'
import { truncateAddress } from '@/utils/truncate'
import { NetworkSwitchModal } from '@/components/modals/network-switch-modal'
import { supportedChains, chainsMap } from '@/utils/networksConfig'
import { HeaderProps } from './header.types'

export const Header: React.FC<HeaderProps> = ({ onConnectClick }) => {
  const chainId = useChainId()
  const { address, isConnected, chain } = useAccount()
  const { isPending } = useConnect()
  const [showNetworkModal, setShowNetworkModal] = useState(false)

  const isNetworkSupported = chain !== undefined

  useEffect(() => {
    if (isConnected && !isNetworkSupported) {
      setShowNetworkModal(true)
    } else {
      setShowNetworkModal(false)
    }
  }, [isConnected, isNetworkSupported])

  return (
    <>
      <header className="absolute top-8 right-8 z-50">
        {!isConnected && !isPending ? (
          <button
            className="px-8.5 py-4 bg-[#090719] text-white font-semibold text-[12px] rounded-full hover:bg-gray-800 hover:cursor-pointer transition"
            onClick={onConnectClick}
          >
            Connect Wallet
          </button>
        ) : (
          <div
            className={
              isNetworkSupported
                ? 'flex p-2 rounded-lg bg-white/25 items-center'
                : 'flex p-2 rounded-lg bg-red-400/25 items-center'
            }
            onClick={() => !isNetworkSupported && setShowNetworkModal(true)}
          >
            <div className="w-[24px] h-[24px] rounded-full overflow-hidden relative">
              <Image
                src="/eth.png"
                fill
                sizes="24px"
                alt="Tari icon"
                className="rounded-full object-cover"
              />
            </div>

            <div className="flex flex-col ml-2">
              <div className="text-[13px] font-semibold">
                {truncateAddress(address ?? '0x', 15)}
              </div>
              <div
                className={`text-[10px] mt-[-5px] ${
                  !isNetworkSupported
                    ? 'text-red-600 font-medium hover:cursor-pointer'
                    : ''
                }`}
              >
                {chainsMap[chainId]}
                {!isNetworkSupported && ' (Click to switch)'}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Network Switch Modal */}
      {showNetworkModal && (
        <NetworkSwitchModal
          closeModal={() => setShowNetworkModal(false)}
          supportedChains={supportedChains}
        />
      )}
    </>
  )
}
