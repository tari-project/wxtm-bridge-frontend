import React from 'react'
import Image from 'next/image'
import { WrapModalProps } from './wrap-modal.types'
import { useBridgeInfo } from '@/hooks/use-bridge-info'
import useTariAccountStore from '@/store/account'
import { getModalTitle } from '@/utils/transaction'
import { openExternalLink } from '@/utils/universe'
import { config } from '@/config'
import { formatUnits } from 'ethers'
import { useTranslation } from 'react-i18next'
import { IoCloseOutline } from 'react-icons/io5'
import { ModalButton } from '../modal-button'

export const WrapModal: React.FC<WrapModalProps> = ({
  tariWalletAddress,
  ethereumAddress,
  fromNetwork,
  feesData,
  closeModal,
  amountAfterFee: amountAfterFeeProp,
  destinationAddress: destAddressProp,
  transactionStatus,
}) => {
  const { i18n, t } = useTranslation('main', { useSuspense: false })
  const ongoingBridgeTx = useTariAccountStore((s) => s.ongoingBridgeTx)
  const bridgeInfo = useBridgeInfo(
    fromNetwork,
    ethereumAddress!,
    tariWalletAddress!,
  )
  const amountAfterFeePending = amountAfterFeeProp
    ? parseFloat(formatUnits(amountAfterFeeProp, 6)).toPrecision()
    : ongoingBridgeTx?.amountAfterFee
    ? parseFloat(formatUnits(ongoingBridgeTx.amountAfterFee, 6)).toPrecision()
    : feesData.amountAfterFee

  const destAddressPending =
    destAddressProp ||
    ongoingBridgeTx?.destinationAddress ||
    bridgeInfo.destAddress

  // Pass the current language to getModalTitle
  const { title, subtext } = getModalTitle(
    bridgeInfo,
    feesData,
    transactionStatus || ongoingBridgeTx,
    i18n.language,
  )

  return (
    <div className="w-full flex flex-col p-6">
      <div className="mt-2">
        {/* Top Section */}
        <div className="w-full flex justify-end">
          <button
            className="text-black font-bold hover:cursor-pointer
                     cursor-pointer flex text-xl rounded-full p-1 bg-black/10 hover:bg-black/20"
            onClick={closeModal}
          >
            <IoCloseOutline />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="w-[63px] h-[63px] rounded-full overflow-hidden mr-1 relative">
            <Image
              src="/icons/clock.png"
              fill
              sizes="63px"
              alt={t('clock_icon_alt')}
              className="rounded-full object-cover"
            />
          </div>
          <div className="font-semibold text-lg mt-2">{title}</div>
          <div className="font-normal text-xs mt-2 text-center px-5">
            {subtext}
          </div>
        </div>

        {/* Section 1 */}
        <div className="flex flex-col my-4">
          <div className="font-medium">
            <div className="text-xs text-gray-500">
              {t('amount_to_receive')}
            </div>
            <div className="text-sm">
              {amountAfterFeePending} {bridgeInfo.toToken}
            </div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          <div className="font-medium">
            <div className="text-xs text-gray-500">
              {t('destination_address')}
            </div>
            <div className="text-sm">{destAddressPending}</div>
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

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          <div className="font-medium">
            <div className="text-xs text-gray-500">{t('transaction_id')}</div>
            <div className="text-sm">GH7SLK9087</div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 mt-2 mb-4"></div> */}

          {/* Section 1 */}
          <ModalButton
            label={t('close')}
            onClick={closeModal}
            disabled={false}
          />
          <div className="mt-8 text-center text-xs text-gray-500">
            {t('having_trouble')}{' '}
            <a
              onClick={(e) => openExternalLink(config.TARI_BRIDGE_FAQ_URL, e)}
              rel="noopener noreferrer"
              className="underline cursor-pointer"
            >
              {t('view_faqs')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
