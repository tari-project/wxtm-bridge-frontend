import { Network } from '@/components/network-box'
import { BridgeFormValues, BridgeInputProps } from '@/components/bridge-input'
import { UseFormSetValue } from 'react-hook-form'

export type MainComponentProps = {
  onConnectClick: () => void
  onContinueClick: () => void
  setValue: UseFormSetValue<BridgeFormValues>
  isValid: boolean
  fromNetwork: Network
  setFromNetwork: React.Dispatch<React.SetStateAction<Network>>
  toNetwork: Network
  setToNetwork: React.Dispatch<React.SetStateAction<Network>>
  addWxtmToWallet?: () => void
  remainingDailyLimit?: number
} & Pick<BridgeInputProps, 'control' | 'errors'>
