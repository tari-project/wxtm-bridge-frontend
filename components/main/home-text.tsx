'use client'
import Image from 'next/image'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const HomeText: React.FC = ({}) => {
  const { t } = useTranslation('main', { useSuspense: false })
  return (
    <div className="flex flex-col gap-5 gap-small w-[clamp(480px,46vw,730px)]">
      <div className="relative w-[116px] h-[126px]">
        <Image src="/icons/coin.png" fill alt="coin icon" className="object-cover" sizes={'116'} />
      </div>
      <div className="font-normal leading-[0.8] text-5xl tracking-tight lg:text-[54px] xl:text-[70px] whitespace-pre-line text-pretty">
        {t('bridge_title_prefix')} <span className="font-semibold">{t('xtm_token')}</span>{' '}
        <span className="hidden short:inline">{t('bridge_title_suffix_inline')}</span>
        <span className="inline short:hidden">{t('bridge_title_suffix_break')}</span>
      </div>
      <div className="font-normal text-[20px] leading-none tracking-tighter lg:text-[24px] xl:text-[27px]">
        {t('bridge_description_prefix')}
        <span className="font-semibold">{t('layerzero_oft')}</span> {t('bridge_description_suffix')}
      </div>
    </div>
  )
}
