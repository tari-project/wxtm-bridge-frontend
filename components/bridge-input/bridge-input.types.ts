import { Control, FieldErrors } from 'react-hook-form'

export type BridgeFormValues = {
  amount: string
}

export type BridgeInputProps = {
  fromNetwork: string
  control: Control<BridgeFormValues>
  errors: FieldErrors<BridgeFormValues>
}
