'use client'

import Account from '@/components/account'
import ConnectionModal from '@/components/connection-modal'
import BridgeModal from '@/components/bridge-modal'
import React, { useState } from 'react'
import { useAccount } from 'wagmi'

const MainModal = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(true)

  function ConnectWallet() {
    const { isConnected } = useAccount()
    if (isConnected)
      return <BridgeModal closeModal={() => setModalOpen(false)} />
    return <ConnectionModal closeModal={() => setModalOpen(false)} />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[0px]">
      <section className="w-full max-w-md mx-4 bg-gray-200 backdrop-blur-3xl rounded-3xl overflow-hidden flex flex-col justify-center items-center">
        {modalOpen ? <ConnectWallet /> : <div></div>}
      </section>
    </div>
  )
}

export default MainModal
