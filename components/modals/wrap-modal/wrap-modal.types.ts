import { MainModalProps } from '@/components/modals/main-modal'
import { BridgeToEthereumFees } from '@/hooks/use-bridge-to-ethereum-fees'

export type WrapModalProps = {
  closeModal: () => void
  feesData: BridgeToEthereumFees
} & Pick<
  MainModalProps,
  'tariWalletAddress' | 'ethereumAddress' | 'fromNetwork'
>
