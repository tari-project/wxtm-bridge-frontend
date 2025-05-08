import { AccountData } from '@/types/tapplet'
import { create } from 'zustand'
import useTariSigner from './signer'

interface State {
  tariAccount?: AccountData
}

interface Actions {
  setTariAccount: () => Promise<void>
}

type OotleWalletStoreState = State & Actions

const initialState: State = {
  tariAccount: undefined,
}

export const useTariAccount = create<OotleWalletStoreState>()((set) => ({
  ...initialState,
  setTariAccount: async () => {
    console.warn('Try to set the Tari acc')
    const signer = useTariSigner.getState().signer
    console.warn('Try to set the Tari signer', signer)
    try {
      if (!signer) {
        return
      }
      const account = await signer.getAccount()
      console.warn('Try to set the Tari account: ', account)
      set({
        tariAccount: {
          account_id: account.account_id,
          address: account.address,
        },
      })
    } catch (error) {
      console.error('Could not set the Tari account: ', error)
    }
  },
}))

export default useTariAccount
