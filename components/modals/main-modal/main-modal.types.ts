import { BridgeFees } from '@/hooks/use-bridge-fees'

export type MainModalProps = {
  success: boolean
  failed: boolean
  step: number
  amount: string
  ethereumAddress?: string
  tariWalletAddress?: string
  feesData: BridgeFees
  closeModal: () => void
  type: 'wrap' | 'unwrap'
}
