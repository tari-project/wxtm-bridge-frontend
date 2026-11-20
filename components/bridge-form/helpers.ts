export function computeInputAvailableBalance(
  isWrapping: boolean,
  tariAvailableBalance: number | undefined,
  evmBalanceRes: bigint | number | undefined,
): number {
  const raw = isWrapping
    ? Number(tariAvailableBalance ?? 0) / 1_000_000
    : Number(evmBalanceRes ?? 0) / 10 ** 18
  return Number.isFinite(raw) ? raw : 0
}
