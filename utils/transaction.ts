import { BridgeToEthereumFees } from '@/hooks/use-bridge-to-ethereum-fees'
import { PendingUserTransaction } from '@/types/tapplet'
import { UserTransactionDTO } from '@tari-project/wxtm-bridge-backend-api'
import { formatUnits } from 'ethers'

export function getWrapModalStatusTitle(
  tx: PendingUserTransaction,
  fromToken: string,
  feeData: BridgeToEthereumFees,
): { title: string; subtext: string } {
  const amount = parseFloat(
    formatUnits(tx.tokenAmount, 6).toString(),
  ).toPrecision()
  const isUnwrapping = fromToken === 'wXTM'
  const bridgingTime = feeData.isOverHighBridgeThreshold ? '24-72h' : '12h'

  switch (tx.status) {
    case UserTransactionDTO.status.PENDING:
      return {
        title: `We're ${
          isUnwrapping ? 'unwrapping' : 'wrapping'
        } your ${amount} ${fromToken}`,
        subtext: `You'll receive ${amount} ${fromToken} in no more than ${bridgingTime}  Funds are automatically transferred from your linked Tari Universe wallet. You don't need to do anything else.`,
      }
    case UserTransactionDTO.status.PROCESSING:
      return {
        title: 'Waiting for confirmation...',
        subtext: `We've received your request. Your funds will be wrapped as soon as the process begins. No action is needed.`,
      }
    case UserTransactionDTO.status.SUCCESS:
      return {
        title: `We've ${
          isUnwrapping ? 'unwrapped' : 'wrapped'
        } your ${amount} ${fromToken}!`,
        subtext: `Your wXTM conversion has been complete and your funds have been deposited into the address specified.`,
      }
    case UserTransactionDTO.status.TIMEOUT:
      return {
        title: `Oops! Your transaction has timed out!`,
        subtext: `We couldn't complete your wrapping request in time. Your XTM remains safe in your Tari wallet — it hasn't been deducted or moved.`,
      }
    case UserTransactionDTO.status.TOKENS_RECEIVED:
      return {
        title: `${fromToken} received - wrapping soon`,
        subtext: `We've received your ${fromToken}. Wrapping is queued and will begin shortly. You'll get wXTM at your Ethereum address once complete.`,
      }
    default:
      return {
        title: 'Unknown transaction status.',
        subtext: ``,
      }
  }
}
