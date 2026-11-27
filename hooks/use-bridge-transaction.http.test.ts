// Through the generated client to fetch: the first wXTM wrap-list request must carry no paging
// parameters, which a backend from before paging refuses (SEC-20).
import { afterEach, describe, expect, it, vi } from 'vitest'

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

const { useTariAccountStore } = await import('@/store/account')
const { useBridgeTransaction } = await import('./use-bridge-transaction')

afterEach(() => vi.unstubAllGlobals())

describe('wXTM history requests', () => {
  it('sends no limit or offset on the first wrap-list request', async () => {
    const urls: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        urls.push(url)
        return new Response(JSON.stringify({ transactions: [], total: 0 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }),
    )
    useTariAccountStore.setState({ tariAccount: { account_id: 1, address: 'tari-me' }, ootleAccount: undefined })

    await useBridgeTransaction().getUserBackendBridgeTxs()

    const wrapList = urls.find((url) => url.includes('/wrap-token/transactions'))
    expect(wrapList).toBeDefined()
    expect(wrapList).toContain('walletAddress=tari-me')
    expect(wrapList).not.toMatch(/[?&](limit|offset)=/)
  })
})
