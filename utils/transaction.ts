import { BridgeInfo } from '@/hooks/use-bridge-info'
import { BridgeToEthereumFees } from '@/hooks/use-bridge-to-ethereum-fees'
import { PendingUserTransaction } from '@/types/tapplet'
import { UserTransactionDTO } from '@tari-project/wxtm-bridge-backend-api'
import { formatUnits } from 'ethers'
import i18n from 'i18next'

export function getModalTitle(
  bridgeInfo: BridgeInfo,
  feeData: BridgeToEthereumFees,
  tx?: PendingUserTransaction,
  language?: string, // <-- add language param
): { title: string; subtext: string } {
  const t = i18n.getFixedT(language || null, 'main') // <-- use language if provided

  if (!tx)
    return {
      title: t('unknown_transaction_status'),
      subtext: ``,
    }

  const amount = parseFloat(
    formatUnits(tx.tokenAmount, 6).toString(),
  ).toPrecision()
  const amountToReceive = parseFloat(
    formatUnits(tx.amountAfterFee, 6).toString(),
  ).toPrecision()
  const bridgingTime = feeData.isOverHighBridgeThreshold ? '24-72h' : '12h'
  const txDirection = bridgeInfo.isWrapping ? 'wrapping' : 'unwrapping'
  const [fromNetwork, toNetwork] = bridgeInfo.isWrapping
    ? ['Tari', 'Ethereum']
    : ['Ethereum', 'Tari']
  const isUnwrapping = bridgeInfo.fromToken === 'wXTM'

  switch (tx.status) {
    case UserTransactionDTO.status.PENDING:
      return {
        title: t('pending_title', {
          action: isUnwrapping ? t('unwrapping') : t('wrapping'),
          amount,
          fromToken,
        }),
        subtext: t('pending_subtext', { amount, fromToken, bridgingTime }),
      }
    case UserTransactionDTO.status.PROCESSING:
      return {
        title: t('processing_title'),
        subtext: t('processing_subtext'),
      }
    case UserTransactionDTO.status.SUCCESS:
      return {
        title: t('success_title', {
          action: isUnwrapping ? t('unwrapped') : t('wrapped'),
          amount,
          fromToken,
        }),
        subtext: t('success_subtext'),
      }
    case UserTransactionDTO.status.TIMEOUT:
      return {
        title: t('timeout_title'),
        subtext: t('timeout_subtext'),
      }
    case UserTransactionDTO.status.TOKENS_RECEIVED:
      return {
        title: t('tokens_received_title', { fromToken }),
        subtext: t('tokens_received_subtext', { fromToken }),
      }
    default:
      return {
        title: t('unknown_transaction_status'),
        subtext: ``,
      }
  }
}
