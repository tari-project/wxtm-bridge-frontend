import { TariToEthInputProps } from '../tari-to-eth-input'

export type MainComponentProps = {
  onConnectClick: () => void
  onContinueClick: () => void
  isValid: boolean
} & Pick<TariToEthInputProps, 'control' | 'errors'>
