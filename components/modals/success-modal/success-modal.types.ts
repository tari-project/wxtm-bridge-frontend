import { MainModalProps } from '@/components/modals/main-modal'

export type SuccessModalProps = {
  closeModal: () => void
  amountAfterFee?: string
  destinationAddress?: string
} & Pick<
  MainModalProps,
  'amount' | 'tariWalletAddress' | 'ethereumAddress' | 'fromNetwork'
>
