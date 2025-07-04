'use client'

import React from 'react'
import { config } from '@/config'
import { openExternalLink } from '@/utils/universe'
import { useTranslation } from 'react-i18next'

export const FooterText: React.FC = ({}) => {
  const { t } = useTranslation('main', { useSuspense: false })

  return (
    <div className="fixed bottom-0 mb-4 left-0 w-full text-center text-xs items-center justify-center leading-[200%]">
      <div className="text-gray-500">
        {t('bridge_one_way_notice')}
        <br />
        <a
          onClick={(e) => openExternalLink(config.TARI_BRIDGE_FAQ_URL, e)}
          rel="noopener noreferrer"
          className="underline cursor-pointer font-normal text-black"
        >
          {t('see_faq')}
        </a>
        <span className="text-black"> | </span>
      </div>

      <a
        onClick={(e) => openExternalLink(config.TARI_SC_AUDIT_URL, e)}
        rel="noopener noreferrer"
        className="underline cursor-pointer font-normal text-black"
      >
        {t('view_smart_contract_audit')}
      </a>
    </div>
  )
}
