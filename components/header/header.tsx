'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useAccount, useDisconnect } from 'wagmi'
import { truncateAddress } from '@/utils/truncate'
import { NetworkSwitchModal } from '@/components/modals/network-switch-modal'
import { chainsMap } from '@/utils/networksConfig'
import { useBridgeStatus } from '@/hooks/use-bridge-status'
import useAppStore from '@/store/app'
import { setIsModalOpen } from '@/store/modal'
import { FiLogOut } from 'react-icons/fi'
import { useTariAccountStore } from '@/store/account'
import { ConnectWalletButton } from '../connect-wallet-button'

export const Header = () => {
  const bridgeTxs = useTariAccountStore((s) => s.combinedBridgeTxs)
  const { getSupportedChains } = useAppStore()

  const { isOffline } = useBridgeStatus()
  const { address, isConnected, chain } = useAccount()
  const supportedChains = getSupportedChains()
  const { disconnect } = useDisconnect()

  const [showNetworkModal, setShowNetworkModal] = useState(false)

  const exampleItem = bridgeTxs.find((tx) => tx.paymentId !== '')
  const isNetworkSupported =
    chain !== undefined && supportedChains.some((c) => c.id === chain.id)
  const shouldShowNetworkModal = useMemo(
    () => isConnected && !isNetworkSupported,
    [isConnected, isNetworkSupported]
  )

  function networkClick() {
    if (!isNetworkSupported) {
      setShowNetworkModal(true)
      return
    }
  }
  const handleConnectClick = () => {
    if (!isConnected) {
      setIsModalOpen(true)
    }
  }

  const defaultMarkup = (
    <header className="absolute top-8 right-8 z-50 flex items-center space-x-4">
      <div className="flex flex-row items-center gap-4">
        {exampleItem && (
          <div
            className="w-[308px] h-[48px] cursor-pointer"
            onClick={handleDisplayTransaction}
          >
          </div>
        )}
        <ConnectWalletButton />
        {isConnected && (
          <div
            className={`flex px-3 py-1 gap-2 h-[48px] rounded-3xl justify-center items-center ${
              isNetworkSupported ? 'bg-white/25' : 'bg-red-400/25'
            }`}
            onClick={networkClick}
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
            <div className="flex flex-col gap-1">
              <div className="text-[12px] leading-none font-semibold">
                {truncateAddress(address ?? '0x', 15)}
              </div>
              <div
                className={`text-[9px] mt-[-3px] leading-none ${
                  !isNetworkSupported
                    ? 'text-red-600 font-medium hover:cursor-pointer'
                    : ''
                }`}
              >
                {chainsMap[chain?.id]}
                {!isNetworkSupported && ' (Click to switch)'}
              </div>
            </div>
            <div
              className="overflow-hidden opacity-35 hover:opacity-55 hover:cursor-pointer"
              onClick={() => disconnect()}
            >
              <FiLogOut size={18} />
            </div>
          </div>
        )}
      </div>
    </header>
  )

  return (
    <>
      {!isOffline && defaultMarkup}

      {/* Network Switch Modal */}
      {shouldShowNetworkModal && showNetworkModal && (
        <NetworkSwitchModal
          closeModalAction={() => setShowNetworkModal(false)}
          supportedChains={supportedChains}
        />
      )}
    </>
  )
}
