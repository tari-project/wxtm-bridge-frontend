import React, { useCallback } from 'react'
import Image from 'next/image'
import { FailedModalProps } from './failed-modal.types'
import { ModalButton } from '@/components/modals/modal-button'

import useTariAccountStore from '@/store/account'
import useTariSigner from '@/store/signer'
import { useTranslation } from 'react-i18next'

export const FailedModal: React.FC<FailedModalProps> = ({
  closeModal,
  paymentId: paymentIdProp,
}) => {
  const signer = useTariSigner((s) => s.signer)
  const ongoingBridgeTx = useTariAccountStore((s) => s.ongoingBridgeTx)
  const removeOngoingTransaction = useTariAccountStore(
    (s) => s.removeOngoingTransaction,
  )
  const { t } = useTranslation('main', { useSuspense: false })

  const handleOnClick = useCallback(async () => {
    closeModal()
    removeOngoingTransaction()
    if (signer) await signer.removeOngoingBridgeTx()
  }, [closeModal, removeOngoingTransaction, signer])

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
          <div className="font-semibold text-lg mt-2">
            {t('something_went_wrong')}
          </div>
          <div className="font-normal text-xs mt-2 text-center px-3">
            {t('wrap_failed_message')}
          </div>
        </div>

        {/* Section 1 */}
        <div className="flex flex-col my-4">
          <div className="font-medium">
            <div className="text-xs text-gray-500">{t('transaction_id')}</div>
            <div className="text-sm">
              {paymentIdProp || ongoingBridgeTx?.paymentId}
            </div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>
          <ModalButton
            label={t('close')}
            onClick={handleOnClick}
            disabled={false}
          />
        </div>
      </div>
    </div>
  )
}
