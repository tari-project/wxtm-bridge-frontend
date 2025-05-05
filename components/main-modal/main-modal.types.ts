export type MainModalProps = {
  setModalOpen: (open: boolean) => void
  success: boolean
  step: number
  setStep: (step: number) => void
  handleBridgeToEthereum: () => void
  amount: string
  ethereumAddress?: string
  tariWalletAddress?: string
}
