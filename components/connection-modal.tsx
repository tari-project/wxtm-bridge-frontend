'use client'

import Account from '@/components/account'
import WalletOptions from '@/components/wallet-options'
import { useAccount } from 'wagmi'

function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}

const ConnectionModal = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <section className="p-20 border-1 border-white rounded-xl bg-zinc-900/80 backdrop-blur">
        <ConnectWallet />
      </section>
    </div>
  )
}

export default ConnectionModal
