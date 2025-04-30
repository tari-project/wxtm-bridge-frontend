import { useAccount, useDisconnect, useEnsName, useChainId } from 'wagmi'

const Account = () => {
  const chainId = useChainId()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })

  const chainMap: Record<number, string> = {
    1: 'Ethereum',
    11155111: 'Sepolia',
    84532: 'Base Sepolia',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Network */}
      {chainId && (
        <div className="flex flex-col items-center">
          <div>chainId: {chainId}</div>
          <div>Network:</div> {chainMap[chainId] ?? 'Unknown Network'}
        </div>
      )}

      {/* Wallet Address */}
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}

      {/* Disconnect */}
      <button
        className="p-2 bg-zinc-950/40 rounded-sm border-1 border-white/55 duration-200 max-w-50 hover:border-white/85 hover:bg-zinc-950/10 hover:cursor-pointer"
        onClick={() => disconnect()}
      >
        Disconnect
      </button>
    </div>
  )
}

export default Account
