import React, { useCallback } from 'react'
import Image from 'next/image'
import { FailedModalProps } from './failed-modal.types'
import { ModalButton } from '@/components/modals/modal-button'

import useTariAccount from '@/store/account'

export const FailedModal: React.FC<FailedModalProps> = ({ closeModal }) => {
  const ongoingBridgeTx = useTariAccount((s) => s.ongoingBridgeTx)
  const removeOngoingTransaction = useTariAccount(
    (s) => s.removeOngoingTransaction,
  )

  const handleOnClick = useCallback(() => {
    closeModal()
    removeOngoingTransaction()
  }, [closeModal, removeOngoingTransaction])

  return (
    <div className="w-full flex flex-col p-6">
      <div className="mt-2">
        {/* Top Section */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-[49px] h-[49px] rounded-full overflow-hidden mr-1 relative">
            <Image
              src="/icons/timeout.png"
              fill
              sizes="49px"
              alt="Timeout"
              className="rounded-full object-cover"
            />
          </div>
          <div className="font-semibold text-lg mt-2">Something went wrong</div>
          <div className="font-normal text-xs mt-2 text-center px-3">
            We couldn&apos;t complete your wrapping request in time. <br /> Your
            XTM remains safe in your Tari wallet — it hasn&apos;t been deducted
            or moved.
          </div>
        </div>

        {/* Section 1 */}
        <div className="flex flex-col my-4">
          <div className="font-medium">
            <div className="text-xs text-gray-500">Transaction ID</div>
            <div className="text-sm">{ongoingBridgeTx?.paymentId}</div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>
          <ModalButton label="Retry" onClick={handleOnClick} disabled={false} />
        </div>
      </div>
    </div>
  )
}
