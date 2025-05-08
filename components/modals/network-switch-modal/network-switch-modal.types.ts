export type NetworkSwitchModalProps = {
  closeModal: () => void
  supportedChains: {
    id: number
    name: string
    icon: string
  }[]
}
