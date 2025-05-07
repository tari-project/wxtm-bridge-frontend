import { Network } from '@/components/network-box'
import { BridgeInputProps } from '@/components/bridge-input'

export type MainComponentProps = {
  onConnectClick: () => void
  onContinueClick: () => void
  isValid: boolean
  fromNetwork: Network
  setFromNetwork: React.Dispatch<React.SetStateAction<Network>>
  toNetwork: Network
  setToNetwork: React.Dispatch<React.SetStateAction<Network>>
} & Pick<BridgeInputProps, 'control' | 'errors'>
