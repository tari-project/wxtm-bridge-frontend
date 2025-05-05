import { UseFormRegister } from 'react-hook-form'

export type MainFormValues = { amount: number }

export type MainComponentProps = {
  onConnectClick: () => void
  onContinueClick: () => void
  register: UseFormRegister<MainFormValues>
}
