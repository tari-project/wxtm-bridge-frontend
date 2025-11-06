'use client'

import React from 'react'
import { config } from '@/config'
import { openExternalLink } from '@/utils/universe'
import { useTranslation } from 'react-i18next'

export const FooterText: React.FC = ({}) => {
  const { t } = useTranslation('main', { useSuspense: false })

  return (
    <div className="absolute bottom-2 left-0 w-full text-center text-xs text-black/50 items-center justify-center whitespace-pre-line leading-[200%] pl-(--tu-padding-left)">
      <a
        onClick={(e) => openExternalLink(config.TARI_BRIDGE_FAQ_URL, e)}
        rel="noopener noreferrer"
        className="underline cursor-pointer font-normal text-black mt-2"
      >
        {t('see_faq')}
      </a>
      <span className="text-black"> | </span>
      <a
        onClick={(e) => openExternalLink(config.TARI_SC_AUDIT_URL, e)}
        rel="noopener noreferrer"
        className="underline cursor-pointer font-normal text-black"
      >
        {t('view_smart_contract_audit')}
      </a>
      .
    </div>
  )
}
