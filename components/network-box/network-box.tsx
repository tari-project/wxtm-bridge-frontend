import React from 'react'
import Image from 'next/image'
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io'

import { NetworkBoxProps } from './network-box.types'

export const NetworkBox = ({ type, selected, isOpen, networks, onToggle, onSelect }: NetworkBoxProps) => {
  const getTokenSymbol = () => {
    if (type === 'from') {
      return selected.name === 'Tari' ? 'XTM' : 'wXTM'
    } else {
      if (selected.name === 'Tari') return 'XTM'
      return 'wXTM'
    }
  }

  const getFilteredNetworks = () => {
    return networks.filter((network) => network.name !== selected.name)
  }

  const tokenSymbol = getTokenSymbol()
  const filteredNetworks = getFilteredNetworks()

  return (
    <div className="relative">
      <div className="flex items-center gap-3 p-2 px-4 bg-white rounded-xl border border-gray-200 min-h-[90px] max-h-[90px]">
        <div className="w-[38px] h-[38px] relative rounded-full overflow-hidden ml-3">
          <Image
            src={selected.icon}
            fill
            alt={selected.name}
            sizes="38px"
            className="object-cover rounded-full"
            onError={(e) => {
              ;(e.target as HTMLImageElement).srcset = ''
              ;(e.target as HTMLImageElement).src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38"%3E%3Ccircle cx="19" cy="19" r="19" fill="%23ccc"%3E%3C/circle%3E%3Ctext x="19" y="25" font-family="Arial" font-size="20" fill="%23fff" text-anchor="middle"%3E%3F%3C/text%3E%3C/svg%3E'
            }}
          />
        </div>
        <div className="flex flex-col text-xs text-gray-500 font-medium">
          <div>{type === 'from' ? 'From' : 'To'}</div>
          <div className="text-xl font-bold text-[#171717] -my-1">{tokenSymbol}</div>
          <div>{selected.name}</div>
        </div>

        <div className="ml-auto cursor-pointer mr-2" onClick={onToggle}>
          {isOpen ? <IoIosArrowUp className="text-xl" /> : <IoIosArrowDown className="text-xl" />}
        </div>
      </div>

      {isOpen && (
        <div className="absolute bottom-full left-0 mt-2 mb-1.5 w-full z-50 bg-white rounded-xl shadow-lg p-3 space-y-2">
          {filteredNetworks.map((network) => (
            <div
              key={network.name}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelect(network)}
            >
              <div className="w-6 h-6 relative">
                <Image
                  src={network.icon}
                  fill
                  alt={network.name}
                  sizes="24px"
                  className="object-cover rounded-full"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).srcset = ''
                    ;(e.target as HTMLImageElement).src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Ccircle cx="12" cy="12" r="12" fill="%23ccc"%3E%3C/circle%3E%3Ctext x="12" y="16" font-family="Arial" font-size="14" fill="%23fff" text-anchor="middle"%3E%3F%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-800">{network.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
