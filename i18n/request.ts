import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.

  /** @dev Fetch dynamically from Tari Universe */

  const locale = 'pl'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
