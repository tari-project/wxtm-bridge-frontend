import TariL1Signer from '@/clients/tari-l1-signer'
import { create } from 'zustand'

export interface SignerStore<TSigner extends TariL1Signer> {
  signer: TSigner | null

  setSigner(signer: TSigner): void
}

const useTariSigner = create<SignerStore<TariL1Signer>>()((set) => ({
  signer: null,
  setSigner(signer) {
    console.info(
      '[ TAPPLET-BRIDGE ] set tari signer with name:',
      signer.signerName,
    )

    set({ signer })
  },
}))

export default useTariSigner
