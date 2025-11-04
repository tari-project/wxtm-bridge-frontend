import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { WrapTokenService, GetWrapTokenServiceStatusRespDTO } from '@tari-project/wxtm-bridge-backend-api'

export const useBridgeStatus = () => {
  const [status, setStatus] = useState<GetWrapTokenServiceStatusRespDTO['status'] | undefined>()
  const { mutateAsync } = useMutation({
    mutationFn: WrapTokenService.getServiceStatus,
  })

  useEffect(() => {
    mutateAsync()
      .then((r) => {
        setStatus(r.status)
      })
      .catch((e) => {
        console.error('[ TAPPLET-BRIDGE] is offline or unreachable', e)
        setStatus(GetWrapTokenServiceStatusRespDTO.status.OFFLINE)
      })
  }, [mutateAsync])

  return {
    bridgeStatus: status,
    isOffline: true,
    //isOffline: status !== GetWrapTokenServiceStatusRespDTO.status.ONLINE
  }
}
