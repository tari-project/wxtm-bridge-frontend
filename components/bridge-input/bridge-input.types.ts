import { Network } from '@/components/network-box'

export type BridgeFormValues = {
  amount: string
}

export type BridgeInputProps = {
  fromNetwork: Network
  availableBalance: number
  remainingDailyLimit?: number
  isTari: boolean
}
