import { MainModalProps } from '@/components/modals/main-modal'
import { BridgeToEthereumFees } from '@/hooks/use-bridge-to-ethereum-fees'

export type SuccessModalProps = {
  closeModal: () => void
  feesData: BridgeToEthereumFees
} & Pick<
  MainModalProps,
  'amount' | 'tariWalletAddress' | 'ethereumAddress' | 'fromNetwork'
>
