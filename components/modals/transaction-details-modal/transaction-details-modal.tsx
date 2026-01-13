import { FailedModal } from '@/components/modals/failed-modal'
import { SuccessModal } from '@/components/modals/success-modal'
import { WrapModal } from '@/components/modals/wrap-modal'
import { getStatusInfo } from '@/components/transactions/helpers'
import { BridgeFees } from '@/hooks/use-bridge-fees'
import { getTransactionAmount } from '@/utils/transaction'
import { memo, useMemo, useRef } from 'react'
import { TransactionDetailsModalProps } from './transaction-details-modal.types'

const TransactionDetailsModal = memo(function TransactionDetailsModal({
  transaction,
  closeModal,
}: TransactionDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const statusInfo = getStatusInfo(transaction.status)
  const { amount: tokenAmount } = getTransactionAmount(transaction)

  const modalMarkup = useMemo(() => {
    const feesData: BridgeFees = {
      feeAmount: transaction.feeAmount,
      amountAfterFee: transaction.amountAfterFee,
      feePercentage: 50,
      isOverHighBridgeThreshold: false,
    }
    switch (statusInfo.statusType) {
      case 'pending':
        return (
          <WrapModal
            closeModal={closeModal}
            feesData={feesData}
            tariWalletAddress={transaction.sourceAddress}
            ethereumAddress={transaction.destinationAddress}
            amountAfterFee={transaction.amountAfterFee}
            destinationAddress={transaction.destinationAddress}
            transactionStatus={transaction}
            type={transaction.type}
          />
        )

      case 'completed':
        return (
          <SuccessModal
            closeModal={closeModal}
            amount={tokenAmount}
            tariWalletAddress={transaction.sourceAddress}
            ethereumAddress={transaction.destinationAddress}
            detailedTx={transaction}
            type={transaction.type}
          />
        )

      case 'timeout':
        return <FailedModal closeModal={closeModal} paymentId={transaction.paymentId} />

      default:
        return <></>
    }
  }, [closeModal, statusInfo, tokenAmount, transaction])

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
      <section
        ref={modalRef}
        className="w-full max-w-md mx-4 bg-[#E0DFDE] shadow-[0px_4px_74px_0px_rgba(0,0,0,0.15)] backdrop-blur-[54px] rounded-3xl overflow-hidden flex flex-col justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {modalMarkup}
      </section>
    </div>
  )
})

export { TransactionDetailsModal }
