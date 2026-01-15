import TariL1Signer from '@/clients/tari-l1-signer'
import { create } from 'zustand'

export interface SignerStore<TSigner extends TariL1Signer> {
  signer: TSigner | null
}

const useTariSignerStore = create<SignerStore<TariL1Signer>>()(() => ({
  signer: null,
}))

export const setSigner = (signer: TariL1Signer) => useTariSignerStore.setState({ signer })

export default useTariSignerStore
