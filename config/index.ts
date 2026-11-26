// Builds loaded by a Tari Universe dev build: allows its dev-server origin and an http://localhost backend.
const UNIVERSE_DEV_BUILD = process.env.NEXT_PUBLIC_ALLOW_UNIVERSE_DEV_ORIGIN === 'true'

export const config = {
  BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL ?? '',
  WALLET_CONNECT_PROJECT_ID:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? '',
  MIN_BRIDGE_AMOUNT: 1000,
  MAX_BRIDGE_AMOUNT: 1000000000,
  HIGH_BRIDGE_THRESHOLD: 100000,
  TARI_BRIDGE_FAQ_URL:
    'https://tarilabs.notion.site/Tari-Universe-Bridge-x-User-Guide-FAQs-2014e6c995c38094b4e4e98a1a3e8ec1',
  TARI_SC_AUDIT_URL:
    'https://www.coinspect.com/doc/Coinspect%20-%20Smart%20Contract%20Audit%20-%20Tari%20-%20wXTM%20Bridge%20-%20Fix%20Review%20-%20v250528.pdf',
  MAINNET_EXPLORER_URL: 'https://etherscan.io',
  MICRO_XTM_PER_XTM: 1_000_000,
  // The only origins whose messages the tapplet accepts and posts to. Mirrors Tari Universe's
  // src-tauri/tauri.conf.json: Tauri v2 webview origins (tauri://localhost on macOS/Linux,
  // https://tauri.localhost on Windows, http://tauri.localhost if useHttpsScheme is turned off) and
  // build.devUrl (http://localhost:1420) only in builds made with NEXT_PUBLIC_ALLOW_UNIVERSE_DEV_ORIGIN=true.
  UNIVERSE_DEV_BUILD,
  UNIVERSE_ORIGINS: UNIVERSE_DEV_BUILD
    ? ['tauri://localhost', 'https://tauri.localhost', 'http://tauri.localhost', 'http://localhost:1420']
      : ['tauri://localhost', 'https://tauri.localhost', 'http://tauri.localhost'],
}
