'use client'

import Image from 'next/image'
import { useConnect } from 'wagmi'
import { IoCloseOutline } from 'react-icons/io5'
import { ConnectionModalProps } from './connection-modal.types'

const icons: { [key: string]: string } = {
  MetaMask: '/icons/metamask.png',
  WalletConnect: '/icons/walletconnect.png',
  // Add other connectors as needed
}

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
        <div className="ml-1 flex flex-col">
          <h2 className="text-lg font-bold">Connect a Wallet</h2>
          <span className="text-sm font-bold text-gray-500 mt-1">
            This will be the destination for your wXTM
          </span>
        </div>

        {/* Below to be changed to one connector only */}
        <div className="p-4">
          <div className="rounded-3xl bg-[#F8F8F9]/80 flex flex-col justify-center overflow-hidden">
            {connectors.map((connector, index) => (
              <div
                key={connector.uid}
                className={`w-full ${
                  index < connectors.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <button
                  onClick={() => connect({ connector })}
                  className="hover:bg-gray-200/80 hover:cursor-pointer p-4 font-bold w-full text-left flex gap-2 items-center px-6"
                >
                  {icons[connector.name] && (
                    <div className="w-[42px] h-[42px] rounded-xl overflow-hidden relative">
                      <Image
                        src={icons[connector.name]}
                        fill
                        sizes="42px"
                        alt={`${connector.name} icon`}
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
