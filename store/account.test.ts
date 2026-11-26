import { describe, expect, it, vi } from 'vitest'
import type TariL1Signer from '@/clients/tari-l1-signer'
import { setTariAccount, useTariAccountStore } from './account'
import { setSigner } from './signer'

describe('setTariAccount', () => {
  it('loads the balance and the Ootle wrap to resume when the address is rejected', async () => {
    const ongoing = { paymentId: 'p1', network: 'Ootle', clientToken: 'secret', ootleTransactionId: 'tx1' }
    setSigner({
      getAccount: vi.fn(async () => {
        throw new Error('Universe returned an invalid Tari address')
      }),
      getTariBalance: vi.fn(async () => ({ available_balance: 42 })),
      getOngoingBridgeTx: vi.fn(async () => ongoing),
    } as unknown as TariL1Signer)
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await setTariAccount()

    const state = useTariAccountStore.getState()
    expect(state.tariAccount).toEqual({ account_id: 0, address: '' })
    expect(state.availableBalance).toBe(42)
    expect(state.lastOngoingPaymentIdFromTU).toBe('p1')
    expect(state.ootleWrapToResume).toEqual(ongoing)
  })
})
