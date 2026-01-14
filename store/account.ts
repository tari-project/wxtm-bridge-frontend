import { AccountData, OngoingUserTransaction } from '@/types/tapplet'
import { create } from 'zustand'
import useTariSigner from './signer'
import { BackendBridgeTransaction, BackendUnwrapTransaction, CombinedBridgeTransaction } from '@/types/transactions'
import TariL1Signer from '@/clients/tari-l1-signer'

interface TariL1WalletStoreState {
  tariAccount?: AccountData
  availableBalance: number
  ongoingBridgeTx?: OngoingUserTransaction
  lastOngoingPaymentIdFromTU: string
  backendBridgeTxs: BackendBridgeTransaction[]
  backendUnwrapTxs: BackendUnwrapTransaction[]
  combinedBridgeTxs: CombinedBridgeTransaction[]
  detailedTx?: CombinedBridgeTransaction | null
  exceededDailyLimit: boolean
}

const initialState: TariL1WalletStoreState = {
  tariAccount: {
    account_id: 0,
    address: '',
  },
  availableBalance: 0,
  ongoingBridgeTx: undefined,
  lastOngoingPaymentIdFromTU: '',
  backendBridgeTxs: [],
  backendUnwrapTxs: [],
  combinedBridgeTxs: [],
  exceededDailyLimit: false,
}

export const useTariAccountStore = create<TariL1WalletStoreState>()(() => ({
  ...initialState,
}))

export const setTariAccount = async () => {
  if (process.env.NODE_ENV === 'development') return

  const signer = useTariSigner.getState().signer

  if (!signer) {
    console.error('[ TAPPLET-BRIDGE ] signer undefined')
    return
  }

  try {
    const account = await signer.getAccount()
    const balance = await signer.getTariBalance()
    const ongoingBridgeTx = await signer.getOngoingBridgeTx()

    useTariAccountStore.setState({
      tariAccount: {
        account_id: account.account_id,
        address: account.address,
      },
      availableBalance: balance?.available_balance || 0,
      lastOngoingPaymentIdFromTU: ongoingBridgeTx?.paymentId ?? '',
    })

    return
  } catch (error) {
    console.error('[ TAPPLET-BRIDGE ] error setting the Tari account: ', error)
  }
}

export const setLastOngoingBridgeTx = (ongoingBridgeTx: OngoingUserTransaction) =>
  useTariAccountStore.setState({ ongoingBridgeTx })

export const removeOngoingTransaction = () => {
  useTariAccountStore.setState({
    ongoingBridgeTx: undefined,
    lastOngoingPaymentIdFromTU: '',
  })
}

export const getBackendBridgeTxsFromTU = async () => {
  const signer = useTariSigner.getState().signer
  try {
    if (!signer) {
      console.error('[ TAPPLET-BRIDGE ] signer undefined')
      return []
    }
    const backendBridgeTxs = await signer.getBackendBridgeTxs()

    useTariAccountStore.setState({
      backendBridgeTxs: backendBridgeTxs,
    })
    return backendBridgeTxs
  } catch (error) {
    console.error('[ TAPPLET-BRIDGE ] error getting bridge transactions:', error)
    return []
  }
}
export const setBackendBridgeTxs = (txs: BackendBridgeTransaction[]) => {
  useTariAccountStore.setState({
    backendBridgeTxs: txs,
  })
}
export const setBackendUnwrapTxs = (txs: BackendUnwrapTransaction[]) => {
  useTariAccountStore.setState({
    backendUnwrapTxs: txs,
  })
}
export const setCombinedBridgeTxs = (wrapTxs: BackendBridgeTransaction[], unwrapTxs: BackendUnwrapTransaction[]) => {
  const combined: CombinedBridgeTransaction[] = [
    ...wrapTxs.map((tx) => ({ ...tx, type: 'wrap' as const })),
    ...unwrapTxs.map((tx) => ({ ...tx, type: 'unwrap' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  useTariAccountStore.setState({
    combinedBridgeTxs: combined,
  })
}
export const setDetailedTx = (detailedTx: CombinedBridgeTransaction | null) =>
  useTariAccountStore.setState({
    detailedTx: detailedTx,
  })
export const setExceededDailyLimit = (exceededDailyLimit: boolean) =>
  useTariAccountStore.setState({ exceededDailyLimit })
