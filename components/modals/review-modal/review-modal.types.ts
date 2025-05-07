import { MainModalProps } from '@/components/modals/main-modal'

export type ReviewModalProps = {
  closeModal: () => void
} & Pick<
  MainModalProps,
  | 'handleBridgeToEthereum'
  | 'handleBridgeToTari'
  | 'isBridging'
  | 'amount'
  | 'tariWalletAddress'
  | 'ethereumAddress'
  | 'fromNetwork'
  | 'toNetwork'
>
