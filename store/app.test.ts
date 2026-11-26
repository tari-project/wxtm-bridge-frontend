import { describe, expect, it, vi } from 'vitest'
import type TariL1Signer from '@/clients/tari-l1-signer'
import useAppStore, { setAppConfig } from './app'
import { setSigner } from './signer'

describe('setAppConfig', () => {
  it('leaves isMainNet false when Universe does not confirm the network', async () => {
    const getNetwork = vi.fn(async () => {
      throw new Error('Universe returned an unknown network')
    })
    setSigner({ getNetwork } as unknown as TariL1Signer)
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await setAppConfig()

    expect(getNetwork).toHaveBeenCalled()
    expect(useAppStore.getState().isMainNet).toBe(false)
    expect(useAppStore.getState().walletConnectProjectId).toBe('')
  })
})
