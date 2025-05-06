export type Network = {
  name: string
  icon: string
}

export type NetworkBoxProps = {
  type: 'from' | 'to'
  selected: Network
  isOpen: boolean
  networks: Network[]
  onToggle: () => void
  onSelect: (network: Network) => void
}
