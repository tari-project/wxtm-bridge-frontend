import { MainModalProps } from '../main-modal'

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
