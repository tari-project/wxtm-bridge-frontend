import { MainModalProps } from '@/components/modals/main-modal'

export type WrapModalProps = {
  closeModal: () => void
} & Pick<
  MainModalProps,
  'amount' | 'tariWalletAddress' | 'ethereumAddress' | 'fromNetwork'
>
