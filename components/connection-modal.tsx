'use client'

import { useConnect } from 'wagmi'
import { IoCloseOutline } from 'react-icons/io5'

interface ConnectionModalProps {
  closeModal: () => void
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({ closeModal }) => {
  const { connectors, connect } = useConnect()

  return (
    <div className="w-full flex flex-col mt-9">
      <button
        className="text-black font-bold hover:cursor-pointer
        absolute top-4 right-4 cursor-pointer flex text-xl rounded-full p-1 bg-black/10 hover:bg-black/20"
        onClick={closeModal}
      >
        <IoCloseOutline />
      </button>

      <div className="flex justify-between items-center p-4">
        <h2 className="text-lg font-bold mt-2 mb-[-1rem] ml-1">
          Connect a Wallet
        </h2>
      </div>

      <div className="p-4">
        <div className="rounded-3xl bg-white flex flex-col justify-center overflow-hidden px-6">
          {connectors.map((connector, index) => (
            <div
              key={connector.uid}
              className={`w-full ${
                index < 2 ? 'border-b border-gray-200' : ''
              }`}
            >
              <button
                onClick={() => connect({ connector })}
                className="hover:bg-[#F8F8F9]/80 hover:cursor-pointer p-4 font-bold w-full text-left"
              >
                {connector.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ConnectionModal
