import { Control, FieldErrors } from 'react-hook-form'
import { Network } from '@/components/network-box'

export type BridgeFormValues = {
  amount: string
}

export type BridgeInputProps = {
  fromNetwork: Network
  control: Control<BridgeFormValues>
  errors: FieldErrors<BridgeFormValues>
}
