import React, { useCallback, useState } from 'react'
import Image from 'next/image'

import { SuccessModalProps } from './success-modal.types'
import { ModalButton } from '@/components/modals/modal-button'
import { useBridgeInfo } from '@/hooks/use-bridge-info'
import useTariAccountStore from '@/store/account'
import { utils } from 'ethers'
import useTariSigner from '@/store/signer'
import {
  CopyIconWrapper,
  CopyText,
  HelperText,
  OfficialContractAddressConainer,
  OfficialContractAddressWrapper,
} from './success-modal.styles'
import { useWalletUtils } from '@/hooks/use-wallet'
import { config } from '@/config'
import { CopyIcon } from '@/styles/copyIcon'
import { sendErrorMessage } from '@/utils/universe'
import { useTranslation } from 'react-i18next'
import { getTransactionAmount } from '@/utils/transaction'

export const SuccessModal: React.FC<SuccessModalProps> = ({
  closeModal,
  amount: _amountProp,
  tariWalletAddress,
  ethereumAddress,
  fromNetwork,
  detailedTx,
}) => {
  const { t } = useTranslation('main', { useSuspense: false })
  const signer = useTariSigner((s) => s.signer)
  const ongoingBridgeTx = useTariAccountStore((s) => s.ongoingBridgeTx)
  const removeOngoingTransaction = useTariAccountStore(
    (s) => s.removeOngoingTransaction,
  )
  const { fromToken, toToken } = useBridgeInfo(
    fromNetwork,
    ethereumAddress!,
    tariWalletAddress!,
  )
  const { addXtmToWallet } = useWalletUtils()
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = useCallback(() => {
    navigator.clipboard.writeText(config.WXTM_CONTRACT_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [])

  const handleAddWxtmToWallet = useCallback(() => {
    console.info('[ TAPPLET-BRIDGE ] Adding WXTM token to the wallet initiated')
    addXtmToWallet()
      .then(() => {
        console.info(
          '[ TAPPLET-BRIDGE ] Adding WXTM token to the wallet successful',
        )
      })
      .catch((error) => {
        sendErrorMessage(
          `Request failed. Feature not supported by your wallet app.`,
        )
        console.error(
          '[ TAPPLET-BRIDGE ] Fail to add WXTM token to the wallet: ',
          error,
        )
      })
  }, [addXtmToWallet])
  const handleOnClick = useCallback(async () => {
    closeModal()
    removeOngoingTransaction()
    if (signer) await signer.removeOngoingBridgeTx()
  }, [closeModal, removeOngoingTransaction, signer])

  const transaction = detailedTx || ongoingBridgeTx
  const { amount: txAmount, decimals } = transaction
    ? getTransactionAmount(transaction)
    : { amount: '0', decimals: 6 }
  const amount = parseFloat(utils.formatUnits(txAmount, decimals)).toPrecision()

  const txAmountToReceive = transaction?.amountAfterFee ?? '0'
  const amountToReceive = parseFloat(
    utils.formatUnits(txAmountToReceive, decimals),
  ).toPrecision()

  const destAddress = detailedTx
    ? detailedTx.destinationAddress
    : ongoingBridgeTx?.destinationAddress ?? ''

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
        <div style={{ height: 20 }} />
        <OfficialContractAddressConainer>
          <OfficialContractAddressWrapper>
            <span className="label">{t('official_wxtm_token_address')}</span>
            <span className="address">{config.WXTM_CONTRACT_ADDRESS}</span>
          </OfficialContractAddressWrapper>
          <CopyIconWrapper onClick={handleCopyAddress}>
            <CopyIcon size={16} />
            {copied && (
              <CopyText
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {t('copied')}
              </CopyText>
            )}
          </CopyIconWrapper>
        </OfficialContractAddressConainer>
        <div style={{ height: 10 }} />
        <HelperText>
          <div className="strong">{t('how_to_view_wxtm_in_wallet')}</div>
          <div>
            {t('how_to_view_wxtm_step1_prefix')}
            <span className="strong">{t('token_address')}</span>
            {t('how_to_view_wxtm_step1_middle')}
            <span className="strong">{t('ethereum_mainnet')}</span>
            {t('how_to_view_wxtm_step1_network')}
            <span className="btn" onClick={handleAddWxtmToWallet}>
              {t('click_here')}
            </span>
            {t('how_to_view_wxtm_step2')}
          </div>
        </HelperText>
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
            <div className="text-sm">{destAddress}</div>
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
