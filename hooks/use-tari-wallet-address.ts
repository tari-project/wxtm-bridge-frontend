import { useState } from 'react'

export const useTariWalletAddress = () => {
  //TODO use a real tari wallet address
  const [tariWalletAddress] = useState<string>(
    '3a1F8934h12k_tari_wallet_address_32h123la9392BC',
  )

  return {
    tariWalletAddress,
  }
}
