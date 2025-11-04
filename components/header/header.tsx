'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useAccount, useChainId } from 'wagmi'
import { truncateAddress } from '@/utils/truncate'
import { NetworkSwitchModal } from '@/components/modals/network-switch-modal'
import { supportedChains, chainsMap } from '@/utils/networksConfig'
import { HeaderProps } from './header.types'
import { BridgeHistoryListItem } from '../transactions/BridgeListItem'
import useTariAccountStore from '@/store/account'

export const Header = ({ onConnectClickAction, isOffline }: HeaderProps) => {
  const chainId = useChainId()
  const { address, isConnected, chain } = useAccount()
  const [showNetworkModal, setShowNetworkModal] = useState(false)
  const bridgeTxs = useTariAccountStore((s) => s.combinedBridgeTxs)
  const exampleItem = bridgeTxs.find((tx) => tx.paymentId !== '')
  const setDetailedTx = useTariAccountStore((s) => s.setDetailedTx)

  const isNetworkSupported = chain !== undefined

  const handleDisplayTransaction = () => {
    if (exampleItem) {
      setDetailedTx(exampleItem)
    }
  }

  useEffect(() => {
    if (isConnected && !isNetworkSupported) {
      setShowNetworkModal(true)
    } else {
      setShowNetworkModal(false)
    }
  }, [isConnected, isNetworkSupported])

  const defaultMarkup = (
    <header className="absolute top-8 right-8 z-50 flex items-center space-x-4">
      <div className="flex flex-row items-center gap-4">
        {exampleItem && (
          <div className="w-[308px] h-[48px] cursor-pointer" onClick={handleDisplayTransaction}>
            <BridgeHistoryListItem
              key={exampleItem.createdAt}
              item={exampleItem}
              index={0}
              itemIsNew={true}
              setDetailedTx={setDetailedTx}
            />
          </div>
        )}
        {!isConnected ? (
          <button
            className="w-[154.27px] min-w-[154.27px] max-w-[154.27px] h-[51px] rounded-[100px] bg-[#090719] text-white font-semibold text-[12px] hover:bg-gray-800 hover:cursor-pointer transition"
            onClick={onConnectClickAction}
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
              <Image src="/eth.png" fill sizes="24px" alt="Tari icon" className="rounded-full object-cover" />
            </div>

            <div className="flex flex-col ml-2">
              <div className="text-[13px] font-semibold">{truncateAddress(address ?? '0x', 15)}</div>
              <div
                className={`text-[10px] mt-[-5px] ${
                  !isNetworkSupported ? 'text-red-600 font-medium hover:cursor-pointer' : ''
                }`}
              >
                {chainsMap[chainId]}
                {!isNetworkSupported && ' (Click to switch)'}
              </div>
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
      {!isOffline && showNetworkModal && (
        <NetworkSwitchModal closeModal={() => setShowNetworkModal(false)} supportedChains={supportedChains} />
      )}
    </>
  )
}
