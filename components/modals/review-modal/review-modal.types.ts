import { MainModalProps } from '@/components/modals/main-modal'
import { BridgeFees } from '@/hooks/use-bridge-fees'

export type ReviewModalProps = {
  closeModal: () => void
  feesData: BridgeFees
} & Pick<MainModalProps, 'amount' | 'tariWalletAddress' | 'ethereumAddress'>
