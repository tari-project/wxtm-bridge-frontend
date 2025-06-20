'use client'
import { config } from '@/config'
import { openExternalLink } from '@/utils/universe'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const FooterText: React.FC = ({}) => {
  const { t } = useTranslation('main', { useSuspense: false })
  return (
    <div className="fixed bottom-0 mb-4 left-0 w-full text-center text-xs text-gray-500 items-center justify-center whitespace-pre-line">
      {t('bridge_one_way_notice')}{' '}
      <a
        onClick={(e) => openExternalLink(config.TARI_BRIDGE_FAQ_URL, e)}
        rel="noopener noreferrer"
        className="underline cursor-pointer"
      >
        {t('see_faq')}
      </a>
      .{' '}
      <a
        onClick={(e) => openExternalLink(config.TARI_SC_AUDIT_URL, e)}
        rel="noopener noreferrer"
        className="underline cursor-pointer"
      >
        {t('view_smart_contract_audit')}
      </a>
      .
    </div>
  )
}
