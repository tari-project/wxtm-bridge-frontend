'use client'
import Image from 'next/image'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const HomeText: React.FC = ({}) => {
  const { t } = useTranslation('main', { useSuspense: false })
  return (
    <div className="flex flex-col gap-6 gap-small w-[clamp(500px,50vw,740px)]">
      <div className="relative w-[116px] h-[126px]">
        <Image src="/icons/coin.png" fill alt="coin icon" className="object-cover" />
      </div>
      <div className="font-normal leading-[0.8] text-5xl tracking-tight lg:text-7xl xl:text-8xl">
        {t('bridge_title_prefix')} <span className="font-semibold">{t('xtm_token')}</span>{' '}
        <span className="hidden short:inline">{t('bridge_title_suffix_inline')}</span>
        <span className="inline short:hidden">{t('bridge_title_suffix_break')}</span>
      </div>
      <div className="font-normal text-xl leading-[0.95] tracking-tighter lg:text-2xl xl:text-3xl">
        {t('bridge_description_prefix')}
        <span className="font-semibold">{t('layerzero_oft')}</span> {t('bridge_description_suffix')}
      </div>
    </div>
  )
}
