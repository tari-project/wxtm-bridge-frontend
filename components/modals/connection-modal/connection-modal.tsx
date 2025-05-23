'use client'

import Image from 'next/image'
import { useConnect } from 'wagmi'
import { IoCloseOutline } from 'react-icons/io5'
import { ConnectionModalProps } from './connection-modal.types'

const ConnectionModal: React.FC<ConnectionModalProps> = ({ closeModal }) => {
  const { connectors, connect } = useConnect()

  return (
    <div className="w-full flex flex-col relative">
      <button
        className="text-black font-bold hover:cursor-pointer absolute top-4 right-4 cursor-pointer flex text-xl rounded-full p-1 bg-black/10 hover:bg-black/20"
        onClick={closeModal}
      >
        <IoCloseOutline />
      </button>
      <div className="mt-10 px-4">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-bold  ml-1">Connect a Wallet</h2>
        </div>

        {/* Below to be changed to one connector only */}
        <div className="p-4">
          <div className="rounded-3xl bg-[#F8F8F9]/80 flex flex-col justify-center overflow-hidden">
            {connectors.map((connector, index) => (
              <div
                key={connector.uid}
                className={`w-full ${
                  index < 2 ? 'border-b border-gray-200' : ''
                }`}
              >
                <button
                  onClick={() => connect({ connector })}
                  className="hover:bg-gray-200/80 hover:cursor-pointer p-4 font-bold w-full text-left flex gap-2 items-center px-6"
                >
                  {connector.name === 'WalletConnect' && (
                    <div className="w-[42px] h-[42px] rounded-xl overflow-hidden relative">
                      <Image
                        src="/icons/walletconnect.png"
                        fill
                        sizes="42px"
                        alt={`Wallet`}
                        className="object-cover"
                      />
                    </div>
                  )}

                  {connector.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionModal
