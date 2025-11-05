import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { WrapTokenService, GetWrapTokenServiceStatusRespDTO } from '@tari-project/wxtm-bridge-backend-api'

export const useBridgeStatus = () => {
  const [status, setStatus] = useState<GetWrapTokenServiceStatusRespDTO['status'] | undefined>()
  const { mutateAsync } = useMutation({
    mutationFn: WrapTokenService.getServiceStatus,
  })

  useEffect(() => {
    function getStatus() {
      mutateAsync()
        .then((r) => {
          setStatus(r.status)
          console.info('[ TAPPLET-BRIDGE] bridge status=', r.status)
        })
        .catch((e) => {
          console.error('[ TAPPLET-BRIDGE] is offline or unreachable', e)
          setStatus(GetWrapTokenServiceStatusRespDTO.status.OFFLINE)
        })
    }
    getStatus()

    const statusInterval = setInterval(getStatus, 1000 * 60 * 5) // check every 5 min
    return () => clearInterval(statusInterval)
  }, [mutateAsync])

  return {
    bridgeStatus: status,
    isOffline: status !== GetWrapTokenServiceStatusRespDTO.status.ONLINE,
  }
}
