'use client'

import Image from 'next/image'
import { useConnect } from 'wagmi'
import { IoCloseOutline } from 'react-icons/io5'
import { ConnectionModalProps } from './connection-modal.types'
import { useTranslation } from 'react-i18next'

const ConnectionModal: React.FC<ConnectionModalProps> = ({ closeModal }) => {
  const { connectors, connect } = useConnect()
  const { t } = useTranslation('main', { useSuspense: false })

  return (
    <div className="w-full flex flex-col relative">
      <button
        className="text-black font-bold hover:cursor-pointer absolute top-4 right-4 cursor-pointer flex text-xl rounded-full p-1 bg-black/10 hover:bg-black/20"
        onClick={closeModal}
        aria-label={t('close')}
      >
        <IoCloseOutline />
      </button>
      <div className="mt-10 px-4">
        <div className="ml-1 flex flex-col">
          <h2 className="text-lg font-bold">{t('connect_wallet_title')}</h2>
          <span className="text-sm font-bold text-gray-500 mt-1">
            {t('connect_wallet_subtitle')}
          </span>
        </div>

        <div className="p-4">
          <div className="rounded-3xl bg-[#F8F8F9]/80 flex flex-col justify-center overflow-hidden">
            {connectors.slice(0, 1).map((connector) => (
              <div key={connector.uid} className="w-full">
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
                        alt={t('wallet_icon_alt')}
                        className="object-cover"
                      />
                    </div>
                  )}

                  {t(`connector_${connector.name.toLowerCase()}`, {
                    defaultValue: connector.name,
                  })}
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
