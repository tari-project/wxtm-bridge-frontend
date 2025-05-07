import { Control, FieldErrors } from 'react-hook-form'

export type TariToEthFormValues = {
  amount: string
}

export type TariToEthInputProps = {
  fromNetwork: string
  control: Control<TariToEthFormValues>
  errors: FieldErrors<TariToEthFormValues>
}
