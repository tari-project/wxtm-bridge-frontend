import { MainModalProps } from '@/components/modals/main-modal'

export type SuccessModalProps = {
  closeModal: () => void
} & Pick<
  MainModalProps,
  'amount' | 'tariWalletAddress' | 'ethereumAddress' | 'fromNetwork'
>
