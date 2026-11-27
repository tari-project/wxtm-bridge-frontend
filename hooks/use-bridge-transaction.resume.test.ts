// Drives the real history hook outside React: the wXTM listings carry only a reference (SEC-20).
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  wraps: vi.fn(),
  unwraps: vi.fn(),
  ootleUnwraps: vi.fn(),
  evm: { address: undefined as string | undefined },
}))

vi.mock('zustand', async () => {
  const { createStore } = await import('zustand/vanilla')
  type StateCreator<T> = import('zustand/vanilla').StateCreator<T>
  return {
    create:
      () =>
      <T>(init: StateCreator<T>) => {
        const api = createStore<T>()(init)
        const hook = (selector: (s: T) => unknown = (s) => s) => selector(api.getState())
        return Object.assign(hook, api)
      },
  }
})
vi.mock('wagmi', () => ({ useConnection: () => mocks.evm }))
vi.mock('@tari-project/wxtm-bridge-backend-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tari-project/wxtm-bridge-backend-api')>()),
  WrapTokenService: { getUserTransactions: mocks.wraps },
  TokensUnwrappedService: { getUserTransactions: mocks.unwraps },
  OotleTokensUnwrappedService: { getOotleUserUnwrapTransactions: mocks.ootleUnwraps },
}))

const { UserTransactionDTO, UserUnwrappedTransactionDTO } = await import('@tari-project/wxtm-bridge-backend-api')
const { useTariAccountStore } = await import('@/store/account')
const { ootleWrapReference } = await import('@/utils/ootle-wrap-reference')
const { useBridgeTransaction } = await import('./use-bridge-transaction')

const PAYMENT_ID = '9b2f4c1e-3a5d-4e6f-8a7b-1c2d3e4f5a6b'
const listed = (status: (typeof UserTransactionDTO.status)[keyof typeof UserTransactionDTO.status]) => ({
  reference: ootleWrapReference(PAYMENT_ID),
  tokenAmount: '1000',
  amountAfterFee: '997',
  feeAmount: '3',
  createdAt: '2026-11-10T10:00:00.000Z',
  status,
  destinationAddress: '0x1',
})

describe('wXTM history keyed by reference (SEC-20)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.unwraps.mockResolvedValue({ transactions: [], total: 0 })
    useTariAccountStore.setState({
      tariAccount: { account_id: 1, address: 'tari-me' },
      lastOngoingPaymentIdFromTU: '',
      ongoingBridgeTx: {
        type: 'wrap',
        paymentId: PAYMENT_ID,
        tokenAmount: '1000',
        amountAfterFee: '997',
        createdAt: '2026-11-10T10:00:01.000Z',
        status: UserTransactionDTO.status.PENDING,
        destinationAddress: '0x1',
      },
    })
  })

  it('pages the wrap list and keeps the real paymentId of the stored wrap when it completes', async () => {
    mocks.wraps.mockResolvedValue({ transactions: [listed(UserTransactionDTO.status.SUCCESS)], total: 1 })

    const ongoing = await useBridgeTransaction().getUserBackendBridgeTxs()

    expect(mocks.wraps).toHaveBeenCalledWith('tari-me', 100, 0)
    expect(ongoing).toMatchObject({ paymentId: PAYMENT_ID, status: UserTransactionDTO.status.SUCCESS })
  })

  it('updates only the status of the stored wrap while it is on hold', async () => {
    mocks.wraps.mockResolvedValue({ transactions: [listed(UserTransactionDTO.status.ON_HOLD)], total: 1 })

    const ongoing = await useBridgeTransaction().getUserBackendBridgeTxs()

    expect(ongoing).toMatchObject({ paymentId: PAYMENT_ID, status: UserTransactionDTO.status.ON_HOLD })
  })

  describe('after a restart, with only the id Universe stored', () => {
    beforeEach(() => {
      useTariAccountStore.setState({ ongoingBridgeTx: undefined, lastOngoingPaymentIdFromTU: PAYMENT_ID })
    })

    it('stores an in-progress wrap under its real paymentId', async () => {
      mocks.wraps.mockResolvedValue({ transactions: [listed(UserTransactionDTO.status.PENDING)], total: 1 })

      await useBridgeTransaction().getUserBackendBridgeTxs()

      expect(useTariAccountStore.getState().ongoingBridgeTx).toMatchObject({ paymentId: PAYMENT_ID })
    })

    it('completes the wrap under its real paymentId, even once one was stored under the reference', async () => {
      useTariAccountStore.setState({
        ongoingBridgeTx: {
          type: 'wrap',
          paymentId: ootleWrapReference(PAYMENT_ID),
          tokenAmount: '1000',
          amountAfterFee: '997',
          createdAt: '2026-11-10T10:00:00.000Z',
          status: UserTransactionDTO.status.PENDING,
          destinationAddress: '0x1',
        },
      })
      mocks.wraps.mockResolvedValue({ transactions: [listed(UserTransactionDTO.status.SUCCESS)], total: 1 })

      const ongoing = await useBridgeTransaction().getUserBackendBridgeTxs()

      expect(ongoing).toMatchObject({ paymentId: PAYMENT_ID, status: UserTransactionDTO.status.SUCCESS })
    })
  })

  it('shows a burn rejected for its target as failed, found by its transaction hash (SEC-20)', async () => {
    const BURNER = '0x1111111111111111111111111111111111111111'
    mocks.evm.address = BURNER
    mocks.wraps.mockResolvedValue({ transactions: [], total: 0 })
    mocks.ootleUnwraps.mockResolvedValue({
      transactions: [
        {
          reference: 'ref-rejected',
          chainId: 84532,
          destinationAddress: '',
          amount: '1000',
          amountAfterFee: '0',
          feeAmount: '0',
          createdAt: '2026-11-10T10:05:00.000Z',
          transactionHash: '0xabcdef',
          blockTimestamp: '2026-11-10T10:00:00.000Z',
          status: 'REJECTED',
        },
      ],
      total: 1,
    })
    useTariAccountStore.setState({
      ootleAccount: undefined,
      lastOngoingPaymentIdFromTU: '',
      ongoingBridgeTx: {
        type: 'unwrap',
        paymentId: '',
        amount: '1000',
        amountAfterFee: '990',
        createdAt: '2026-11-10T10:00:00.000Z',
        transactionHash: '0xABCDEF',
        blockTimestamp: '',
        status: UserUnwrappedTransactionDTO.status.PENDING,
        destinationAddress: 'otl_bad',
        ootleChainId: 84532,
      },
    })

    const ongoing = await useBridgeTransaction().getUserBackendBridgeTxs()

    expect(mocks.ootleUnwraps).toHaveBeenCalledWith(BURNER, 100, 0)
    expect(ongoing).toMatchObject({
      type: 'unwrap',
      status: UserUnwrappedTransactionDTO.status.REJECTED,
      showModal: true,
    })
    mocks.evm.address = undefined
  })
})
