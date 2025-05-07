import { Network } from '@/components/network-box'

export type MainModalProps = {
  setModalOpen: (open: boolean) => void
  success: boolean
  step: number
  setStep: (step: number) => void
  handleBridgeToEthereum: () => void
  handleBridgeToTari: () => void
  isBridging: boolean
  amount: string
  ethereumAddress?: string
  tariWalletAddress?: string
  fromNetwork: Network
  toNetwork: Network
}
