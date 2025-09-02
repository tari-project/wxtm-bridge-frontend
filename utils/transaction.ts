import { BridgeInfo } from '@/hooks/use-bridge-info'
import { BridgeFees } from '@/hooks/use-bridge-fees'
import { OngoingUserTransaction } from '@/types/tapplet'
import { UserTransactionDTO } from '@tari-project/wxtm-bridge-backend-api'
import { utils } from 'ethers'
import i18n from 'i18next'

export function getModalTitle(
  bridgeInfo: BridgeInfo,
  feeData: BridgeFees,
  tx?: OngoingUserTransaction,
  language?: string,
): { title: string; subtext: string } {
  const t = i18n.getFixedT(language || null, 'main')

  if (!tx)
    return {
      title: t('unknown_transaction_status'),
      subtext: ``,
    }

  const amount = parseFloat(
    utils.formatUnits(tx.tokenAmount, 6).toString(),
  ).toPrecision()

  const bridgingTime = feeData.isOverHighBridgeThreshold ? '24-72h' : '12h'
  const fromToken = bridgeInfo.fromToken

  switch (tx.status) {
    case UserTransactionDTO.status.PENDING:
      return {
        title: t('pending_title', {
          action: bridgeInfo.isWrapping ? t('wrapping') : t('unwrapping'),
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
          action: bridgeInfo.isWrapping ? t('wrapped') : t('unwrapped'),
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
