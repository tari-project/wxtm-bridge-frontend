import { AccountData, OngoingUserTransaction } from '@/types/tapplet'
import { create } from 'zustand'
import useTariSigner from './signer'
import { BackendBridgeTransaction } from '@/types/transactions'
import { UserTransactionDTO } from '@tari-project/wxtm-bridge-backend-api'

interface State {
  tariAccount?: AccountData
  availableBalance: number
  ongoingBridgeTx?: OngoingUserTransaction
  lastOngoingPaymentIdFromTU: string
  backendBridgeTxs: BackendBridgeTransaction[]
  detailedTx?: BackendBridgeTransaction | null
}

interface Actions {
  setTariAccount: () => Promise<void>
  setOngoingTransaction: (tx: OngoingUserTransaction) => void
  removeOngoingTransaction: () => void
  getBackendBridgeTxsFromTU: () => Promise<BackendBridgeTransaction[]>
  setDetailedTx: (detailedTx: BackendBridgeTransaction | null) => void
}

type TariL1WalletStoreState = State & Actions

//TODO REMOVE
const exampleItem: BackendBridgeTransaction = {
  amountAfterFee: '1234',
  createdAt: 'Jun 20, 13:31',
  destinationAddress: 'ss',
  feeAmount: '5',
  paymentId: 'paymentId',
  status: UserTransactionDTO.status.PENDING,
  sourceAddress: 'sourceAddress',
  tokenAmount: '1420000000',
}

const initialState: State = {
  tariAccount: {
    account_id: 0,
    address: '',
  },
  availableBalance: 0,
  ongoingBridgeTx: undefined,
  lastOngoingPaymentIdFromTU: '',
  // TODO backendBridgeTxs: []
  backendBridgeTxs: [
    exampleItem,
    exampleItem,
    exampleItem,
    exampleItem,
    exampleItem,
    exampleItem,
  ],
}

export const useTariAccountStore = create<TariL1WalletStoreState>()((set) => ({
  ...initialState,
  setTariAccount: async () => {
    const signer = useTariSigner.getState().signer
    if (process.env.NODE_ENV === 'development') return
    try {
      if (!signer) {
        console.error('[ TAPPLET-BRIDGE ] signer undefined')
        return
      }
      const account = await signer.getAccount()
      const balance = await signer.getTariBalance()
      const ongoingBridgeTx = await signer.getOngoingBridgeTx()
      const backendBridgeTxs = await signer.getBackendBridgeTxs()
      set({
        tariAccount: {
          account_id: account.account_id,
          address: account.address,
        },
        availableBalance: balance.available_balance,
        lastOngoingPaymentIdFromTU: ongoingBridgeTx?.paymentId ?? '',
        backendBridgeTxs: backendBridgeTxs,
      })

      return
    } catch (error) {
      console.error(
        '[ TAPPLET-BRIDGE ] error setting the Tari account: ',
        error,
      )
    }
  },

  setOngoingTransaction: (tx: OngoingUserTransaction) => {
    set({
      ongoingBridgeTx: tx,
    })
  },
  removeOngoingTransaction: () => {
    set({
      ongoingBridgeTx: undefined,
      lastOngoingPaymentIdFromTU: '',
    })
  },
  getBackendBridgeTxsFromTU: async () => {
    const signer = useTariSigner.getState().signer
    try {
      if (!signer) {
        console.error('[ TAPPLET-BRIDGE ] signer undefined')
        return []
      }
      const backendBridgeTxs = await signer.getBackendBridgeTxs()

      set({
        backendBridgeTxs: backendBridgeTxs,
      })
      return backendBridgeTxs
    } catch (error) {
      console.error(
        '[ TAPPLET-BRIDGE ] error getting bridge transactions:',
        error,
      )
      return []
    }
  },
  setDetailedTx: (detailedTx: BackendBridgeTransaction | null) =>
    set({
      detailedTx: detailedTx,
    }),
}))

export default useTariAccountStore
