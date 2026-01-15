export type NetworkSwitchModalProps = {
  closeModalAction: () => void
  supportedChains: {
    id: number
    name: string
    icon: string
  }[]
}
