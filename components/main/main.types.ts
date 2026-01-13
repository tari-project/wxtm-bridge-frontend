import { Dispatch, SetStateAction } from 'react'
import { Network } from '@/components/network-box'

export type MainComponentProps = {
  fromNetwork: Network
  setFromNetwork: Dispatch<SetStateAction<Network>>
  toNetwork: Network
  setToNetwork: Dispatch<SetStateAction<Network>>
  addWxtmToWallet?: () => void
  remainingDailyLimit?: number
}
