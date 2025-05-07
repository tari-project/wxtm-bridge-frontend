import { Network } from '../network-box'
import { TariToEthInputProps } from '../tari-to-eth-input'

export type MainComponentProps = {
  onConnectClick: () => void
  onContinueClick: () => void
  isValid: boolean
  fromNetwork: Network
  setFromNetwork: React.Dispatch<React.SetStateAction<Network>>
  toNetwork: Network
  setToNetwork: React.Dispatch<React.SetStateAction<Network>>
} & Pick<TariToEthInputProps, 'control' | 'errors'>
