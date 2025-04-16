import React from 'react'
import Image from 'next/image'
import Button from './button'
import { IoCloseOutline } from 'react-icons/io5'

type ReviewModalProps = {
  closeModal: () => void
  nextStep: () => void
}

const ReviewModal: React.FC<ReviewModalProps> = ({ closeModal, nextStep }) => {
  const handleBridge = () => {
    console.log('Bridge in progress...')

    nextStep()
  }

  return (
    <div className="w-full flex flex-col p-6">
      <div className="mt-2">
        {/* Top Section */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col font-semibold">
            <div className=" text-lg">Review transaction</div>
            <div className="text-xs mt-[-4px] text-gray-500">
              Step <span className="text-[#171717]">2</span>/2
            </div>
          </div>

          <button
            className="text-black font-bold hover:cursor-pointer
                 cursor-pointer flex text-xl rounded-full p-1 bg-black/10 hover:bg-black/20"
            onClick={closeModal}
          >
            <IoCloseOutline />
          </button>
        </div>

        {/* Section 1 */}
        <div className="flex justify-between gap-2 mt-4 items-center p-4 rounded-lg bg-white border-[1px] border-gray-200 max-w-[421px]">
          <div className="space-y-[-10px]">
            <div className="font-medium text-sm">Amount to bridge</div>
          </div>

          <div>
            <div className="flex items-center rounded-3xl justify-center">
              <div className="w-[25.63px] h-[25.63px] rounded-full overflow-hidden mr-1 relative">
                <Image
                  src="/icons/tari.png"
                  fill
                  sizes="25.63px"
                  alt="Tari icon"
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex items-center font-semibold text-3xl">
                {(1000).toLocaleString()}
                <div className="text-gray-500 text-xs font-medium ml-1">
                  XTM
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="flex flex-col my-4">
          <div className="font-medium">
            <div className="text-xs text-gray-500">
              {'Source wallet (Tari)'}
            </div>
            <div className="text-sm">
              3a1F8934h12kj34j15h12k3k5j1j32h123ffaalla9392BC
            </div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          <div className="font-medium">
            <div className="text-xs text-gray-500">
              {'Destination address (Ethereum)'}
            </div>
            <div className="text-sm">
              0x1234h12kj34j15h12k3k5j1j32h123ffaalla56789
            </div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          <div className="font-medium">
            <div className="text-xs text-gray-500">You will receive</div>
            <div className="text-sm">{0.9982} wXTM</div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          <div className="flex justify-between">
            <div className="flex flex-col font-medium">
              <div className="text-xs text-gray-500">Network fee</div>
              <div className="text-sm">{0.000024} XTM</div>
            </div>

            <div className="text-gray-500 text-[10px] text-right self-end">
              Fees 0.02%
            </div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          <div className="font-medium">
            <div className="text-xs text-gray-500">Estimated time</div>
            <div className="text-sm">24h</div>
          </div>

          <div className="py-[0.5px] w-full bg-gray-300 my-2"></div>

          <div className="font-medium">
            <div className="text-xs text-gray-500">Transaction ID</div>
            <div className="text-sm">GH7SLK9087</div>
          </div>
        </div>

        {/* Button */}
        <Button
          label="Confirm & Bridge"
          onClick={handleBridge}
          disabled={false}
        />
      </div>
    </div>
  )
}

export default ReviewModal
