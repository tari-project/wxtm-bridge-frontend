// Drives the real wrap hook outside React to check what a send Universe refuses leaves behind.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type TariL1Signer from '@/clients/tari-l1-signer'

const mocks = vi.hoisted(() => ({
  createWrapTokenTransaction: vi.fn(),
  updateToTokensSent: vi.fn(),
  getUserBackendBridgeTxs: vi.fn(),
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
vi.mock('i18next', () => ({ default: { getFixedT: () => (key: string) => key } }))
vi.mock('@tanstack/react-query', () => ({
  useMutation: ({ mutationFn }: { mutationFn: (...args: unknown[]) => unknown }) => ({ mutateAsync: mutationFn }),
}))
vi.mock('./use-bridge-transaction', () => ({
  useBridgeTransaction: () => ({ getUserBackendBridgeTxs: mocks.getUserBackendBridgeTxs }),
}))
vi.mock('@tari-project/wxtm-bridge-backend-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tari-project/wxtm-bridge-backend-api')>()),
  WrapTokenService: {
    createWrapTokenTransaction: mocks.createWrapTokenTransaction,
    updateToTokensSent: mocks.updateToTokensSent,
  },
}))

const { UserTransactionDTO } = await import('@tari-project/wxtm-bridge-backend-api')
const { useBridgeStore } = await import('@/store/bridge')
const { useTariAccountStore } = await import('@/store/account')
const { setSigner } = await import('@/store/signer')
const { useBridgeToEthereum } = await import('./use-bridge-to-ethereum')

const { SignerRefusedError, SignerTimeoutError } = await import('@/clients/tari-l1-signer')

const PAYMENT_ID = 'payment-1'

describe('useBridgeToEthereum when the send is not confirmed', () => {
  let stored: { paymentId: string } | undefined
  const signer = {
    getBaseNodeStatus: vi.fn(async () => ({})),
    getOngoingBridgeTx: vi.fn(async () => stored),
    setOngoingBridgeTx: vi.fn(async (tx: { paymentId: string }) => {
      stored = tx
      return true
    }),
    removeOngoingBridgeTx: vi.fn(async () => {
      stored = undefined
      return true
    }),
    sendOneSided: vi.fn(),
  }

  const WRAP = { amount: '10', ethAddress: '0x1', amountAfterFee: '9' } as const

  beforeEach(() => {
    stored = undefined
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    mocks.createWrapTokenTransaction.mockResolvedValue({ paymentId: PAYMENT_ID })
    setSigner(signer as unknown as TariL1Signer)
    useTariAccountStore.setState({ tariAccount: { account_id: 0, address: 'tari-address' } })
    useBridgeStore.setState({ bridgeError: '', tariColdWalletAddress: 'cold-wallet' })
  })

  it('fails the wrap and clears the stored record when Universe refused the request', async () => {
    signer.sendOneSided.mockRejectedValue(new SignerRefusedError('Invalid arguments'))
    await useBridgeToEthereum().bridgeToEthereum(WRAP)

    expect(useBridgeStore.getState().bridgeError).toBe('wrap_send_failed')
    expect(useTariAccountStore.getState().ongoingBridgeTx).toMatchObject({
      paymentId: PAYMENT_ID,
      status: UserTransactionDTO.status.TIMEOUT,
      showModal: true,
    })
    expect(signer.removeOngoingBridgeTx).toHaveBeenCalled()
    expect(stored).toBeUndefined()
    expect(mocks.updateToTokensSent).not.toHaveBeenCalled()
  })

  it.each([
    ['Universe returned false', new Error('Universe did not send the transaction')],
    ['the call timed out', new SignerTimeoutError('timed out')],
    ['Universe answered with a resultError', 'Error: wallet failure'],
  ])('keeps the stored record and asks the user to check when %s', async (_, error) => {
    signer.sendOneSided.mockRejectedValue(error)
    await useBridgeToEthereum().bridgeToEthereum(WRAP)

    expect(useBridgeStore.getState().bridgeError).toBe('wrap_unconfirmed')
    expect(useTariAccountStore.getState().ongoingBridgeTx?.status).toBe(UserTransactionDTO.status.PENDING)
    expect(signer.removeOngoingBridgeTx).not.toHaveBeenCalled()
    expect(stored).toMatchObject({ paymentId: PAYMENT_ID })
    expect(mocks.updateToTokensSent).not.toHaveBeenCalled()
  })
})
