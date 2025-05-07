import { MainModalProps } from '../main-modal'

export type WrapModalProps = {
  closeModal: () => void
} & Pick<MainModalProps, 'ethereumAddress'>
