import { BridgeInfo } from '@/hooks/use-bridge-info'
import { BridgeToEthereumFees } from '@/hooks/use-bridge-to-ethereum-fees'
import { PendingUserTransaction } from '@/types/tapplet'
import { UserTransactionDTO } from '@tari-project/wxtm-bridge-backend-api'
import { formatUnits } from 'ethers'

export function getModalTitle(
  bridgeInfo: BridgeInfo,
  feeData: BridgeToEthereumFees,
  tx?: PendingUserTransaction,
): { title: string; subtext: string } {
  if (!tx)
    return {
      title: 'Unknown transaction status.',
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

  switch (tx.status) {
    case UserTransactionDTO.status.PENDING:
      return {
        title: `We're ${txDirection} your ${amount} ${bridgeInfo.fromToken}`,
        subtext: `You'll receive ${amountToReceive} ${bridgeInfo.toToken} in no more than ${bridgingTime}. Funds are automatically transferred from your linked ${fromNetwork} wallet. You don't need to do anything else.`,
      }
    case UserTransactionDTO.status.PROCESSING:
      return {
        title: 'Waiting for confirmation...',
        subtext: `We've received your request. Your funds will be wrapped as soon as the process begins. No action is needed.`,
      }
    case UserTransactionDTO.status.SUCCESS:
      return {
        title: `We've ${txDirection} your ${amount} ${bridgeInfo.fromToken}!`,
        subtext: `Your ${bridgeInfo.toToken} conversion has been complete and your funds have been deposited into the address specified.`,
      }
    case UserTransactionDTO.status.TIMEOUT:
      return {
        title: `Oops! Your transaction has timed out!`,
        subtext: `We couldn't complete your ${txDirection} request in time. Your ${bridgeInfo.fromToken} remains safe in your ${fromNetwork} wallet — it hasn't been deducted or moved.`,
      }
    case UserTransactionDTO.status.TOKENS_RECEIVED:
      return {
        title: `${amount} ${bridgeInfo.fromToken} received - ${txDirection} soon`,
        subtext: `We've received your ${bridgeInfo.fromToken}: ${txDirection} is queued and will begin shortly. You'll get ${bridgeInfo.toToken} at your  ${toNetwork} address once complete.`,
      }
    default:
      return {
        title: 'Unknown transaction status.',
        subtext: ``,
      }
  }
}
