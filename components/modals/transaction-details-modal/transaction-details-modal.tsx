import { memo, useRef } from 'react'
import { TransactionDetailsModalProps } from './transaction-details-modal.types'
import { getStatusInfo } from '@/components/transactions/helpers'
import { WrapModal } from '@/components/modals/wrap-modal'
import { SuccessModal } from '@/components/modals/success-modal'
import { FailedModal } from '@/components/modals/failed-modal'
import { Network } from '@/components/network-box'
import { BridgeToEthereumFees } from '@/hooks/use-bridge-to-ethereum-fees'
import { formatNumber, FormatPreset } from '@/utils/formatters'

const TransactionDetailsModal = memo(function TransactionDetailsModal({
  transaction,
  closeModal,
}: TransactionDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const statusInfo = getStatusInfo(transaction.status)

  // Convert tokenAmount from micro-XTM to properly formatted amount for display
  const formattedAmount = formatNumber(
    Number(transaction.tokenAmount),
    FormatPreset.XTM_LONG,
  )

  // Default network for bridging XTM to WXTM
  const tariNetwork: Network = {
    name: 'Tari',
    icon: '/icons/tari.png',
  }

  // Default fees data for WrapModal (using transaction data)
  const feesData: BridgeToEthereumFees = {
    feeAmount: transaction.feeAmount,
    amountAfterFee: transaction.amountAfterFee,
    feePercentage: 50,
    isOverHighBridgeThreshold: false,
  }

  const renderModal = () => {
    // Render appropriate modal based on transaction status
    switch (statusInfo.statusType) {
      case 'pending':
        return (
          <WrapModal
            closeModal={closeModal}
            feesData={feesData}
            tariWalletAddress={transaction.sourceAddress}
            ethereumAddress={transaction.destinationAddress}
            fromNetwork={tariNetwork}
          />
        )

      case 'completed':
        return (
          <SuccessModal
            closeModal={closeModal}
            amount={formattedAmount}
            amountAfterFee={formatNumber(
              Number(transaction.amountAfterFee),
              FormatPreset.XTM_LONG,
            )}
            destinationAddress={transaction.destinationAddress}
            tariWalletAddress={transaction.sourceAddress}
            ethereumAddress={transaction.destinationAddress}
            fromNetwork={tariNetwork}
          />
        )

      case 'timeout':
        return <FailedModal closeModal={closeModal} />

      default:
        return <></>
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <section
        ref={modalRef}
        className="w-full max-w-md mx-4 bg-[#E0DFDE] shadow-[0px_4px_74px_0px_rgba(0,0,0,0.15)] backdrop-blur-[54px] rounded-3xl overflow-hidden flex flex-col justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {renderModal()}
      </section>
    </div>
  )
})

export { TransactionDetailsModal }
