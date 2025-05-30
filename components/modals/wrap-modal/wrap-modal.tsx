import React from 'react'
import Image from 'next/image'
import { WrapModalProps } from './wrap-modal.types'
import { useBridgeInfo } from '@/hooks/use-bridge-info'
import useTariAccount from '@/store/account'
import { formatUnits } from 'ethers'
import { getModalTitle } from '@/utils/transaction'

export const WrapModal: React.FC<WrapModalProps> = ({
  amount,
  tariWalletAddress,
  ethereumAddress,
  fromNetwork,
  feesData,
}) => {
  const { inProgressBridgeTx } = useTariAccount()
  const { fromToken, toToken, destAddress } = useBridgeInfo(
    fromNetwork,
    ethereumAddress!,
    tariWalletAddress!,
  )

  console.log('amount wrap modal', amount)

  const amountAfterFeePending = inProgressBridgeTx?.amountAfterFee
    ? formatUnits(inProgressBridgeTx.amountAfterFee, 6)
    : feesData.amountAfterFee

  const destAddressPending =
    inProgressBridgeTx?.destinationAddress ?? destAddress

  const { title, subtext } = getModalTitle(
    fromToken,
    feesData,
    inProgressBridgeTx,
  )

  return (
    <div className="w-full flex flex-col p-6">
      <div className="mt-2">
        {/* Top Section */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-[63px] h-[63px] rounded-full overflow-hidden mr-1 relative">
            <Image
              src="/icons/clock.png"
              fill
              sizes="63px"
              alt="Clock"
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
            <div className="text-xs text-gray-500">Amount to receive</div>
            <div className="text-sm">
              {parseFloat(amountAfterFeePending).toPrecision()} {toToken}
            </div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          <div className="font-medium">
            <div className="text-xs text-gray-500">Destination address</div>
            <div className="text-sm">{destAddressPending}</div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          <div className="font-medium">
            <div className="text-xs text-gray-500">Current status</div>
            <div className="text-sm">{inProgressBridgeTx?.status}</div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          {/* <div className="font-medium">
            <div className="text-xs text-gray-500">Transaction Details</div>
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
            <div className="text-xs text-gray-500">Transaction ID</div>
            <div className="text-sm">GH7SLK9087</div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 mt-2 mb-4"></div> */}

          {/* Section 1 */}
          {/* <ModalButton label="Done" onClick={closeModal} disabled={false} /> */}
          <div className="mt-8 text-center text-xs text-gray-500">
            Having trouble?{' '}
            <a
              href="https://tarilabs.notion.site/Tari-Universe-Bridge-x-User-Guide-FAQs-2014e6c995c38094b4e4e98a1a3e8ec1"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View FAQs
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
