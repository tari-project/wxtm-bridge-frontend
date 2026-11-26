import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type * as SignerModule from './tari-l1-signer'

const UNIVERSE = 'tauri://localhost'
const MAINNET_ADDRESS =
  '126J92Yow5y9UoRFd1DNujPmVFq9C1ZeiYWT95UKxz5Y1rzbfjtHg4SCZS1dk83ivzt3m2XRQHTaYUk9SwmyeCvy5BJ'

let signerModule: typeof SignerModule
let parent: { postMessage: ReturnType<typeof vi.fn> }
let listeners: ((event: MessageEvent) => void)[]
let ancestorOrigins: string[] | undefined

// Settles the promise into a readable state without failing on rejection.
function track(promise: Promise<unknown>) {
  const state: { status: 'pending' | 'resolved' | 'rejected'; value?: unknown } = { status: 'pending' }
  promise.then(
    (value) => Object.assign(state, { status: 'resolved', value }),
    (value) => Object.assign(state, { status: 'rejected', value }),
  )
  return state
}

function lastCallId(): string {
  return parent.postMessage.mock.lastCall![0].id
}

function reply(data: unknown, { source = parent as unknown, origin = UNIVERSE } = {}) {
  for (const listener of listeners) listener({ source, origin, data } as MessageEvent)
}

async function flush() {
  await vi.advanceTimersByTimeAsync(0)
}

beforeEach(async () => {
  vi.useFakeTimers()
  parent = { postMessage: vi.fn() }
  listeners = []
  ancestorOrigins = [UNIVERSE]
  vi.stubGlobal('window', {
    parent,
    addEventListener: (type: string, listener: (event: MessageEvent) => void) => {
      if (type === 'message') listeners.push(listener)
    },
    dispatchEvent: vi.fn(),
    location: {
      get ancestorOrigins() {
        return ancestorOrigins
      },
    },
  })
  vi.resetModules()
  signerModule = await import('./tari-l1-signer')
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('sendSignerCall', () => {
  it('resolves on a reply from Universe with its id', async () => {
    const call = track(signerModule.sendSignerCall('getNetwork', []))
    reply({ type: 'signer-call', id: lastCallId(), result: 'mainnet' })
    await flush()
    expect(call).toEqual({ status: 'resolved', value: 'mainnet' })
  })

  it('ignores a correct-looking reply from a frame other than the parent', async () => {
    const call = track(signerModule.sendSignerCall('getNetwork', []))
    reply({ type: 'signer-call', id: lastCallId(), result: 'mainnet' }, { source: {} })
    await flush()
    expect(call.status).toBe('pending')
  })

  it('ignores a reply from the parent on an origin that is not allowed', async () => {
    const call = track(signerModule.sendSignerCall('getNetwork', []))
    reply({ type: 'signer-call', id: lastCallId(), result: 'mainnet' }, { origin: 'https://evil.example' })
    await flush()
    expect(call.status).toBe('pending')
  })

  it('rejects nothing on a resultError with an unknown id', async () => {
    const call = track(signerModule.sendSignerCall('getNetwork', []))
    reply({ type: 'signer-call', id: 'unknown', resultError: 'boom' })
    await flush()
    expect(call.status).toBe('pending')
  })

  it('rejects only the call a resultError belongs to', async () => {
    const first = track(signerModule.sendSignerCall('getNetwork', []))
    const firstId = lastCallId()
    const second = track(signerModule.sendSignerCall('getAccount', []))
    reply({ type: 'signer-call', id: lastCallId(), resultError: 'boom' })
    await flush()
    expect(second).toEqual({ status: 'rejected', value: 'boom' })
    expect(first.status).toBe('pending')
    reply({ type: 'signer-call', id: firstId, result: 'mainnet' })
    await flush()
    expect(first.status).toBe('resolved')
  })

  it('resolves nothing when sequential ids are sprayed', async () => {
    const call = track(signerModule.sendSignerCall('getNetwork', []))
    for (let id = 0; id <= 100; id++) {
      reply({ type: 'signer-call', id, result: 'spoofed' })
      reply({ type: 'signer-call', id: String(id), result: 'spoofed' })
    }
    await flush()
    expect(call.status).toBe('pending')
  })

  it('rejects at once without posting when there is no parent frame', async () => {
    ;(window as unknown as { parent: unknown }).parent = window
    const call = track(signerModule.sendSignerCall('getNetwork', []))
    await flush()
    expect(call.status).toBe('rejected')
    expect(call.value).not.toBeInstanceOf(signerModule.SignerTimeoutError)
    expect(parent.postMessage).not.toHaveBeenCalled()
  })

  it('rejects after its timeout and ignores a later reply', async () => {
    const call = track(signerModule.sendSignerCall('getOotleAccount', [], 1000))
    const id = lastCallId()
    await vi.advanceTimersByTimeAsync(1000)
    expect(call.status).toBe('rejected')
    expect(call.value).toBeInstanceOf(signerModule.SignerTimeoutError)
    reply({ type: 'signer-call', id, result: 'late' })
    await flush()
    expect(call.status).toBe('rejected')
  })

  it("posts to the parent's allowed ancestor origin, never '*'", () => {
    void signerModule.sendSignerCall('getNetwork', []).catch(() => {})
    expect(parent.postMessage).toHaveBeenCalledTimes(1)
    expect(parent.postMessage.mock.lastCall![1]).toBe(UNIVERSE)
  })

  it('posts once per allowed origin without ancestorOrigins, then only to the origin Universe replied from', async () => {
    ancestorOrigins = undefined
    void signerModule.sendSignerCall('getNetwork', []).catch(() => {})
    const origins = parent.postMessage.mock.calls.map((call) => call[1])
    expect(origins).toEqual(['tauri://localhost', 'https://tauri.localhost', 'http://tauri.localhost'])

    reply({ type: 'signer-call', id: lastCallId(), result: 'mainnet' }, { origin: 'https://tauri.localhost' })
    parent.postMessage.mockClear()
    void signerModule.sendSignerCall('getNetwork', []).catch(() => {})
    expect(parent.postMessage.mock.calls.map((call) => call[1])).toEqual(['https://tauri.localhost'])
  })
})

describe('TariL1Signer replies', () => {
  async function callWith(run: (signer: SignerModule.TariL1Signer) => Promise<unknown>, result: unknown) {
    const call = track(run(new signerModule.TariL1Signer({})))
    reply({ type: 'signer-call', id: lastCallId(), result })
    await flush()
    return call
  }

  it('accepts bridge envs with an https backend URL', async () => {
    const call = await callWith((s) => s.getBridgeEnvs(), ['project', 'https://bridge.example/api'])
    expect(call).toEqual({ status: 'resolved', value: ['project', 'https://bridge.example/api'] })
  })

  it.each([
    [['project', 'http://bridge.example/api']],
    [['project', 'http://localhost:3001']],
    [['project', 'not a url']],
    [['project']],
    [{ walletconnect_id: 'project', backend_api: 'https://bridge.example' }],
  ])('rejects bridge envs %j in a release build', async (envs) => {
    expect((await callWith((s) => s.getBridgeEnvs(), envs)).status).toBe('rejected')
  })

  it('accepts an http://localhost backend only in builds for a Universe dev build', async () => {
    const envs = ['project', 'http://localhost:3001']
    expect((await callWith((s) => s.getBridgeEnvs(), envs)).status).toBe('rejected')

    vi.stubEnv('NEXT_PUBLIC_ALLOW_UNIVERSE_DEV_ORIGIN', 'true')
    vi.resetModules()
    signerModule = await import('./tari-l1-signer')
    expect((await callWith((s) => s.getBridgeEnvs(), envs)).status).toBe('resolved')
    expect((await callWith((s) => s.getBridgeEnvs(), ['project', 'http://bridge.example'])).status).toBe('rejected')
  })

  it('accepts a Tari address and rejects anything else', async () => {
    const valid = await callWith((s) => s.getAccount(), { account_id: 0, address: MAINNET_ADDRESS })
    expect(valid).toEqual({ status: 'resolved', value: { account_id: 0, address: MAINNET_ADDRESS } })
    expect((await callWith((s) => s.getAccount(), { account_id: 0, address: '0xabc' })).status).toBe('rejected')
  })

  it('rejects an unknown network', async () => {
    expect((await callWith((s) => s.getNetwork(), 'esmeralda')).status).toBe('resolved')
    expect((await callWith((s) => s.getNetwork(), 'evilnet')).status).toBe('rejected')
    expect((await callWith((s) => s.getNetwork(), undefined)).status).toBe('rejected')
  })

  it('treats { error } results and a false sendOneSided as failures', async () => {
    expect((await callWith((s) => s.getTariBalance(), { error: 'Unsupported' })).status).toBe('rejected')
    const send = (s: SignerModule.TariL1Signer) => s.sendOneSided({ amount: '1', address: MAINNET_ADDRESS })
    expect((await callWith(send, false)).status).toBe('rejected')
    expect((await callWith(send, true)).status).toBe('resolved')
  })
})
