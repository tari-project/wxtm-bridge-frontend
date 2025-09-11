import { MainModalProps } from '@/components/modals/main-modal'
import { BridgeFees } from '@/hooks/use-bridge-fees'
import { CombinedBridgeTransaction } from '@/types/transactions'

export type WrapModalProps = {
  closeModal: () => void
  feesData: BridgeFees
  amountAfterFee?: string
  destinationAddress?: string
  transactionStatus?: CombinedBridgeTransaction
  type: 'wrap' | 'unwrap'
} & Pick<
  MainModalProps,
  'tariWalletAddress' | 'ethereumAddress' | 'fromNetwork'
>
