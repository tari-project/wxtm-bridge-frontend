export const config = {
  BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL ?? '',
  WALLET_CONNECT_PROJECT_ID:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? '',
  FEE_PERCENTAGE_BPS: 0.3 * 100, // 0.3% fee
}
