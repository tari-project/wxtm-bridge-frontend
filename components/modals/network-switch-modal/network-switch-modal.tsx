'use client'

import Image from 'next/image'
import { useSwitchChain } from 'wagmi'
import { IoCloseOutline } from 'react-icons/io5'
import { NetworkSwitchModalProps } from './network-switch-modal.types'
import { useTranslation } from 'react-i18next'

export const NetworkSwitchModal = ({ closeModalAction, supportedChains }: NetworkSwitchModalProps) => {
  const switchChain = useSwitchChain()
  const { t } = useTranslation('main', { useSuspense: false })

  const handleSwitchNetwork = (chainId: number) => {
    switchChain.mutate({ chainId })
    closeModalAction()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          className="text-black font-bold absolute top-4 right-4 cursor-pointer flex text-xl rounded-full p-1 bg-black/10 hover:bg-black/20"
          onClick={closeModalAction}
          aria-label={t('close')}
        >
          <IoCloseOutline />
        </button>

        <div className="mt-2 mb-4">
          <h2 className="text-xl font-bold">{t('switch_network')}</h2>
          <p className="text-sm text-gray-600 mt-1">{t('please_connect_supported_network')}</p>
        </div>

        <div className="rounded-xl overflow-hidden">
          {supportedChains.map((chain, index) => (
            <div
              key={chain.id}
              className={`w-full ${index < supportedChains.length - 1 ? 'border-b border-gray-200' : ''}`}
            >
              <button
                onClick={() => handleSwitchNetwork(chain.id)}
                className="hover:bg-gray-200/80 hover:cursor-pointer p-4 font-medium w-full text-left flex items-center gap-3"
              >
                <div className="w-[36px] h-[36px] rounded-full overflow-hidden relative flex-shrink-0">
                  <Image
                    src={chain.icon}
                    fill
                    sizes="36px"
                    alt={`${chain.name} icon`}
                    className="object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).srcset = ''
                      ;(e.target as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"%3E%3Ccircle cx="18" cy="18" r="18" fill="%23ccc"%3E%3C/circle%3E%3Ctext x="18" y="24" font-family="Arial" font-size="18" fill="%23fff" text-anchor="middle"%3E%3F%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>
                <div>
                  <div className="font-bold">{chain.name}</div>
                  <div className="text-xs text-gray-500">{t('click_to_switch')}</div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
