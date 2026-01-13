import { Network } from '@/components/network-box'
import { BridgeFees } from '@/hooks/use-bridge-fees'

export type MainModalProps = {
  success: boolean
  failed: boolean
  step: number
  amount: string
  ethereumAddress?: string
  tariWalletAddress?: string
  fromNetwork: Network
  toNetwork: Network
  feesData: BridgeFees
  closeModal: () => void
  type: 'wrap' | 'unwrap'
}
