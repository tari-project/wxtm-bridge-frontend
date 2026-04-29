'use client'
import { setIsModalOpen } from '@/store/modal'

export const ConnectWalletButton = () => {
  const handleConnectClick = () => {
    setIsModalOpen(true)
  }

  return (
    <button
      className="w-auto min-w-[150px] max-w-[180px] h-[51px] rounded-[100px] bg-[#090719] text-white font-semibold text-[12px] hover:bg-gray-800 hover:cursor-pointer transition"
      onClick={handleConnectClick}
    >
      Connect Wallet
    </button>
  )
}
