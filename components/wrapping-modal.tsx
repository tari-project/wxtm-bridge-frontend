import React from 'react'
import Image from 'next/image'
import Button from './button'
import { HiArrowRightOnRectangle } from 'react-icons/hi2'

type WrappingModalProps = {
  closeModal: () => void
}

const WrappingModal: React.FC<WrappingModalProps> = ({ closeModal }) => {
  /** @dev Tmp hardcoded address */
  const address =
    '0x0bec7941a37c07ec7cd408b3478c66ac7a26c4e48c2fd22577bb2c9c44cb4ae8'

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
          <div className="font-semibold text-lg mt-2">
            We&apos;re wrapping your {(1000).toLocaleString()} XTM
          </div>
          <div className="font-normal text-xs mt-2 text-center px-5">
            You&apos;ll receive {0.9982} wXTM in no more than 12h. Funds are
            automatically transferred from your linked Tari Universe wallet. You
            don&apos;t need to do anything else.
          </div>
        </div>

        {/* Section 1 */}
        <div className="flex flex-col my-4">
          <div className="font-medium">
            <div className="text-xs text-gray-500">You will receive</div>
            <div className="text-sm">{0.9982} wXTM</div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          <div className="font-medium">
            <div className="text-xs text-gray-500">Destination address</div>
            <div className="text-sm">
              0x1F8934h12kj34j15h12k3k5j1j32h123ffaalla939234
            </div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          <div className="font-medium">
            <div className="text-xs text-gray-500">Transaction Details</div>
            <a
              href="https://sepolia.etherscan.io/tx/0x0bec7941a37c07ec7cd408b3478c66ac7a26c4e48c2fd22577bb2c9c44cb4ae8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm underline"
            >
              {`${address.slice(0, 6)}..${address.slice(-5)}`}
              <HiArrowRightOnRectangle className="text-xs stroke-[0.7] ml-1" />
            </a>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          <div className="font-medium">
            <div className="text-xs text-gray-500">Transaction ID</div>
            <div className="text-sm">GH7SLK9087</div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 mt-2 mb-4"></div>

          {/* Section 1 */}
          <Button label="Done" onClick={closeModal} disabled={false} />
        </div>
      </div>
    </div>
  )
}

export default WrappingModal
