// Drives the real history hook outside React: the wXTM listings carry only a reference (SEC-20).
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ wraps: vi.fn(), unwraps: vi.fn() }))

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
vi.mock('wagmi', () => ({ useConnection: () => ({ address: undefined }) }))
vi.mock('@tari-project/wxtm-bridge-backend-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tari-project/wxtm-bridge-backend-api')>()),
  WrapTokenService: { getUserTransactions: mocks.wraps },
  TokensUnwrappedService: { getUserTransactions: mocks.unwraps },
}))

const { UserTransactionDTO } = await import('@tari-project/wxtm-bridge-backend-api')
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
})
