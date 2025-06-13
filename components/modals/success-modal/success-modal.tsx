import React, { useCallback } from 'react'
import Image from 'next/image'
// import { HiArrowRightOnRectangle } from 'react-icons/hi2'
import { SuccessModalProps } from './success-modal.types'
import { ModalButton } from '@/components/modals/modal-button'
import { useBridgeInfo } from '@/hooks/use-bridge-info'
import useTariAccount from '@/store/account'
import { formatUnits } from 'ethers'
import useTariSigner from '@/store/signer'
import { useTranslation } from 'react-i18next'

export const SuccessModal: React.FC<SuccessModalProps> = ({
  closeModal,
  tariWalletAddress,
  ethereumAddress,
  fromNetwork,
}) => {
  const { t } = useTranslation('main', { useSuspense: false })
  const signer = useTariSigner((s) => s.signer)
  const ongoingBridgeTx = useTariAccount((s) => s.ongoingBridgeTx)
  const removeOngoingTransaction = useTariAccount(
    (s) => s.removeOngoingTransaction,
  )

  const { fromToken, toToken } = useBridgeInfo(
    fromNetwork,
    ethereumAddress!,
    tariWalletAddress!,
  )

  const handleOnClick = useCallback(async () => {
    closeModal()
    removeOngoingTransaction()
    if (signer) await signer.removeOngoingBridgeTx()
  }, [closeModal, removeOngoingTransaction, signer])

  const amount = ongoingBridgeTx?.tokenAmount
    ? parseFloat(formatUnits(ongoingBridgeTx?.tokenAmount, 6)).toPrecision()
    : '0'

  const amountToReceive = ongoingBridgeTx?.amountAfterFee
    ? parseFloat(formatUnits(ongoingBridgeTx?.amountAfterFee, 6)).toPrecision()
    : '0'

  return (
    <div className="w-full flex flex-col p-6">
      <div className="mt-2">
        {/* Top Section */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-[49px] h-[49px] rounded-full overflow-hidden mr-1 relative">
            <Image
              src="/icons/tick.png"
              fill
              sizes="49px"
              alt="Tick"
              className="rounded-full object-cover"
            />
          </div>
          <div className="font-semibold text-lg mt-2">
            {t(fromToken === 'wXTM' ? 'success_unwrapped' : 'success_wrapped', {
              amount,
              fromToken,
            })}
          </div>
          <div className="font-normal text-xs mt-2 text-center px-3">
            {t('conversion_complete', { toToken })}
          </div>
        </div>

        {/* Section 1 */}
        <div className="flex flex-col my-4">
          <div className="font-medium">
            <div className="text-xs text-gray-500">
              {t('amount_to_receive')}
            </div>
            <div className="text-sm">
              {amountToReceive} {toToken}
            </div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          <div className="font-medium">
            <div className="text-xs text-gray-500">
              {t('destination_address')}
            </div>
            <div className="text-sm">{ongoingBridgeTx?.destinationAddress}</div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          {/* <div className="font-medium">
            <div className="text-xs text-gray-500">{t('transaction_details')}</div>
            <a
              href="https://sepolia.etherscan.io/tx/0x0bec7941a37c07ec7cd408b3478c66ac7a26c4e48c2fd22577bb2c9c44cb4ae8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm underline"
            >
              {`${txhash.slice(0, 6)}..${txhash.slice(-5)}`}
              <HiArrowRightOnRectangle className="text-xs stroke-[0.7] ml-1" />
            </a>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div> */}

          {/* <div className="font-medium">
            <div className="text-xs text-gray-500">{t('transaction_id')}</div>
            <div className="text-sm">GH7SLK9087</div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 mt-2 mb-4"></div> */}

          {/* Section 1 */}
          <ModalButton label="Close" onClick={handleOnClick} disabled={false} />
        </div>
      </div>
    </div>
  )
}
