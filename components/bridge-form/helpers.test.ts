import { describe, expect, it } from 'vitest'
import { computeInputAvailableBalance } from './helpers'

describe('computeInputAvailableBalance', () => {
  it('returns 0 instead of NaN when EVM balanceRes is undefined', () => {
    expect(computeInputAvailableBalance(false, 5_000_000, undefined)).toBe(0)
  })

  it('returns 0 when EVM balanceRes is non-finite', () => {
    expect(computeInputAvailableBalance(false, 0, Number.NaN)).toBe(0)
    expect(computeInputAvailableBalance(false, 0, Number.POSITIVE_INFINITY)).toBe(0)
  })

  it('converts EVM balanceRes from 18 decimals', () => {
    expect(computeInputAvailableBalance(false, 0, 2_500_000_000_000_000_000n)).toBe(2.5)
    expect(computeInputAvailableBalance(false, 0, 0n)).toBe(0)
  })

  it('converts Tari availableBalance from 6 decimals when wrapping', () => {
    expect(computeInputAvailableBalance(true, 12_345_678, undefined)).toBe(12.345678)
  })

  it('returns 0 when Tari availableBalance is missing or non-finite', () => {
    expect(computeInputAvailableBalance(true, undefined, undefined)).toBe(0)
    expect(computeInputAvailableBalance(true, Number.NaN, undefined)).toBe(0)
  })
})
