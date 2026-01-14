import { useCallback } from 'react'
import { TokensUnwrappedService } from '@tari-project/wxtm-bridge-backend-api'
import { microXtmToXtm } from '@/utils/parse-wxtm-token-amount'

export function useFetchDailyLimit() {
  return useCallback(async () => {
    try {
      const limitMicro = await TokensUnwrappedService.getRemainingDailyLimit()
      return microXtmToXtm(limitMicro)
    } catch (error) {
      console.error('[ TAPPLET-BRIDGE ] Failed to fetch daily limit:', error)
    }
  }, [])
}
