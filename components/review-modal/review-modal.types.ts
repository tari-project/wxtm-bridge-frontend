import { MainModalProps } from '../main-modal'

export type ReviewModalProps = {
  closeModal: () => void
} & Pick<MainModalProps, 'handleBridgeToEthereum' | 'amount'>
