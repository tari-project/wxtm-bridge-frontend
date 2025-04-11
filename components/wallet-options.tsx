'use client'

import { useConnect } from 'wagmi'

const WalletOptions = () => {
  const { connectors, connect } = useConnect()

  return connectors.map((connector) => (
    <div className="flex flex-col mt-2">
      <button
        key={connector.uid}
        onClick={() => connect({ connector })}
        className="rounded-lg border bg-zinc-950/40 border-white/55 px-8 py-2 duration-200 hover:border-white/85 hover:bg-zinc-950/10 hover:cursor-pointer"
      >
        {connector.name}
      </button>
    </div>
  ))
}

export default WalletOptions
